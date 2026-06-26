package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
)

type FlightAlert struct {
	ID               string   `json:"id"`
	TripID           string   `json:"trip_id"`
	OriginIATA       string   `json:"origin_iata"`
	DestinationIATA  string   `json:"destination_iata"`
	DepartureDate    string   `json:"departure_date"`
	ReturnDate       *string  `json:"return_date"`
	TargetPrice      int      `json:"target_price"`
	LowestPriceSeen  *int     `json:"lowest_price_seen"`
	PreferredAirlines []string `json:"preferred_airlines"`
}

type SerpApiGoogleFlightsResponse struct {
	BestFlights []struct {
		Price int `json:"price"`
	} `json:"best_flights"`
	OtherFlights []struct {
		Price int `json:"price"`
	} `json:"other_flights"`
}

func main() {
	// 1. Load Environment Variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on system environment variables.")
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_KEY")
	serpApiKey := os.Getenv("SERPAPI_KEY")

	if supabaseUrl == "" || supabaseKey == "" || serpApiKey == "" {
		log.Fatal("Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY)")
	}

	// 2. Initialize Supabase Client
	sb := supabase.CreateClient(supabaseUrl, supabaseKey)

	log.Println("✈️  Go Flight Scraper Microservice started!")

	// 3. Setup loop
	isCronMode := os.Getenv("CRON_MODE") == "true"
	for {
		log.Println("🔍 Fetching active flight alerts...")

		var alerts []FlightAlert
		err := sb.DB.From("flight_alerts").Select("*").Eq("status", "active").Execute(&alerts)
		if err != nil {
			log.Printf("Error fetching alerts: %v\n", err)
			time.Sleep(5 * time.Minute)
			continue
		}

		if len(alerts) == 0 {
			log.Println("No active alerts found. Sleeping for 5 minutes...")
			time.Sleep(5 * time.Minute)
			continue
		}

		log.Printf("Found %d active alerts to process.\n", len(alerts))

		// 4. Process each alert sequentially (or could be goroutines)
		for _, alert := range alerts {
			processAlert(sb, serpApiKey, alert)
		}

		// Sleep or exit
		if isCronMode {
			log.Println("✅ Cron mode execution complete. Exiting.")
			break
		} else {
			log.Println("💤 Cycle complete. Sleeping for 5 minutes...")
			time.Sleep(5 * time.Minute)
		}
	}
}

func processAlert(sb *supabase.Client, serpApiKey string, alert FlightAlert) {
	log.Printf("-> Processing alert %s: %s to %s", alert.ID, alert.OriginIATA, alert.DestinationIATA)

	// SerpApi Google Flights query
	baseURL := "https://serpapi.com/search.json"
	u, _ := url.Parse(baseURL)
	q := u.Query()
	q.Set("engine", "google_flights")
	q.Set("departure_id", alert.OriginIATA)
	q.Set("arrival_id", alert.DestinationIATA)
	q.Set("outbound_date", alert.DepartureDate)
	if alert.ReturnDate != nil && *alert.ReturnDate != "" {
		q.Set("return_date", *alert.ReturnDate)
		q.Set("type", "1") // Round trip
	} else {
		q.Set("type", "2") // One way
	}
	q.Set("adults", "2") // Search for 2 adults
	q.Set("currency", "BRL")
	q.Set("hl", "pt-BR")
	q.Set("api_key", serpApiKey)
	u.RawQuery = q.Encode()

	// Make HTTP request
	resp, err := http.Get(u.String())
	if err != nil {
		log.Printf("   [Error] Failed to fetch SerpApi: %v", err)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	var serpResp SerpApiGoogleFlightsResponse
	if err := json.Unmarshal(body, &serpResp); err != nil {
		log.Printf("   [Error] Failed to parse SerpApi JSON: %v", err)
		return
	}

	// Find the lowest price
	var lowestPrice int = -1
	if len(serpResp.BestFlights) > 0 {
		lowestPrice = serpResp.BestFlights[0].Price
	} else if len(serpResp.OtherFlights) > 0 {
		lowestPrice = serpResp.OtherFlights[0].Price
	}

	if lowestPrice == -1 {
		log.Printf("   [Info] No flights found for this route/date.")
		return
	}

	lowestPriceInCents := lowestPrice * 100
	log.Printf("   [Success] Lowest price found: R$ %d", lowestPrice)

	// 5. Insert Snapshot into Supabase
	isTriggered := lowestPriceInCents <= alert.TargetPrice

	snapshot := map[string]interface{}{
		"alert_id":     alert.ID,
		"price":        lowestPriceInCents,
		"source":       "google_flights",
		"is_triggered": isTriggered,
	}

	var insertResp interface{}
	err = sb.DB.From("flight_price_snapshots").Insert(snapshot).Execute(&insertResp)
	if err != nil {
		log.Printf("   [Error] Failed to insert snapshot: %v", err)
	}

	// 6. Update Alert (lowest_price_seen and last_checked_at)
	updateData := map[string]interface{}{
		"last_checked_at": time.Now().UTC().Format(time.RFC3339),
	}
	
	if alert.LowestPriceSeen == nil || lowestPriceInCents < *alert.LowestPriceSeen {
		updateData["lowest_price_seen"] = lowestPriceInCents
	}

	if isTriggered {
		// Update status to triggered if target price is met
		updateData["status"] = "triggered"
		log.Printf("   🎉 TARGET PRICE MET! Updating status to triggered.")
	}

	var updateResp interface{}
	err = sb.DB.From("flight_alerts").Update(updateData).Eq("id", alert.ID).Execute(&updateResp)
	if err != nil {
		log.Printf("   [Error] Failed to update alert metadata: %v", err)
	}
}
