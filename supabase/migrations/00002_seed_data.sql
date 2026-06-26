-- ============================================================================
-- OurAdventure — Seed Data
-- Migration: 00002_seed_data
--
-- This migration seeds the exact data from Phase 1 so we can transition
-- to fetching from Supabase without losing the UI state.
-- ============================================================================

-- TRIPS
insert into public.trips (id, name, description, destination, country_code, timezone, start_date, end_date, budget_currency, budget_total, budget_spent, status, created_at, updated_at) values
  ('b71cd818-8094-44b4-8255-6677f54c9c11', 'Aventuras em São Paulo', 'Nossa lista de rolês por Sampa — de iFLY a padarias escondidas', 'São Paulo, SP', 'BR', 'America/Sao_Paulo', '2026-01-01', '2026-12-31', 'BRL', 500000, 35000, 'active', '2026-01-01 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Campos do Jordão ❄️', 'Bate-volta na Serra da Mantiqueira — Ducha de Prata, Pico Itapeva, Palácio Boa Vista', 'Serra da Mantiqueira, SP', 'BR', 'America/Sao_Paulo', '2026-07-01', '2026-07-01', 'BRL', 80000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('12b32f2f-1ab0-4965-ab19-3c345c1f0163', 'Cabreúva 🏨', 'Hotel perto de Jundiaí — tem que ter o bug 🐛', 'Cabreúva, SP', 'BR', 'America/Sao_Paulo', '2026-08-01', '2026-08-03', 'BRL', 200000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('2cd8b30d-efcb-4467-b50f-df16db3eb264', 'Bragança Paulista 🚴', 'Lago do Taboão, cavalos, tirolesa, e conhecer a Clara e a Luna!', 'Bragança Paulista, SP', 'BR', 'America/Sao_Paulo', '2026-09-01', '2026-09-03', 'BRL', 150000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('35b3ee28-097c-4ab4-8e11-eec74b1e3ab5', 'Beto Carrero World 🎢', 'A Promessa™ — Pedro vs. montanha-russa mais radical do Brasil', 'Penha, SC', 'BR', 'America/Sao_Paulo', '2026-10-01', '2026-10-03', 'BRL', 300000, 0, 'planned', '2026-05-02 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('4d5fceca-b1d7-4df3-a1cd-95f265b38f86', 'Patagônia Argentina 🇦🇷', 'El Calafate → El Chaltén → Torres del Paine. Alugar carro, poucos postos de gasolina!', 'El Calafate / El Chaltén', 'AR', 'America/Argentina/Buenos_Aires', '2027-01-15', '2027-01-30', 'BRL', 2000000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('b73e5f72-9a63-4702-8611-e633d2650bb7', 'Mochilão Chile 🇨🇱', 'Ski na cordilheira + Deserto do Atacama — 2 semanas de aventura', 'Santiago / Atacama', 'CL', 'America/Santiago', '2026-07-13', '2026-07-27', 'BRL', 1500000, 0, 'planned', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('8fe3f7e6-7b87-4b95-a50d-dfcf0934e8f8', 'Paris, França 🇫🇷', 'Café Pli Parmentier — 141 Avenue Parmentier, Paris 10', 'Paris', 'FR', 'Europe/Paris', '2027-06-01', '2027-06-10', 'BRL', 3000000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('d39f60bc-5ec7-4e96-a83d-e35b7e923e2a', 'Dolomites, Itália 🇮🇹', 'Lefiro — Santa Cristina Valgardena, paisagens alpinas de tirar o fôlego', 'Santa Cristina Valgardena', 'IT', 'Europe/Rome', '2027-07-01', '2027-07-08', 'BRL', 2500000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('e3a6ff73-f222-4ccb-86ea-19b8df7903ab', 'San Diego 🏄', 'Sol, surf e vibes californianas', 'San Diego, CA', 'US', 'America/Los_Angeles', '2027-09-01', '2027-09-08', 'BRL', 2000000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('f7c32b5f-5d07-42f2-850d-bc0abfc74410', 'Nova York 🗽', 'A cidade que nunca dorme — Central Park, Broadway, pizza', 'New York City, NY', 'US', 'America/New_York', '2027-12-20', '2027-12-30', 'BRL', 3500000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00'),
  ('9b63efdb-2d64-4e1b-bcbb-726ff1af1275', 'Istanbul — Capital dos Gatos 🐱', 'Ver e fazer carinho em TODOS os gatos. Levar malas extras caso a gente resolva morar lá.', 'Istanbul', 'TR', 'Europe/Istanbul', '2028-04-01', '2028-04-12', 'BRL', 2500000, 0, 'draft', '2026-06-26 00:00:00+00', '2026-06-26 00:00:00+00');


-- CHECKLISTS
insert into public.checklists (id, trip_id, name, description, icon, sort_order) values
  ('6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'b71cd818-8094-44b4-8255-6677f54c9c11', 'Rolês em SP', 'Nossa lista de atividades por São Paulo', 'map-pin', 0),
  ('a8385750-7170-4dbb-80df-6ceaf0fcf9d2', '2cd8b30d-efcb-4467-b50f-df16db3eb264', 'Atividades em Bragança', 'Tudo que temos que fazer em Bragança Paulista', 'bike', 0),
  ('c42e12e3-d731-4a4a-9b7e-9cb8c1e3cd29', '35b3ee28-097c-4ab4-8e11-eec74b1e3ab5', 'A Promessa™', 'O Pedro se compromete a encarar a montanha-russa', 'scroll-text', 0);


-- CHECKLIST ITEMS
insert into public.checklist_items (id, checklist_id, label, notes, sort_order, status, assigned_to, due_date) values
  -- SP
  ('12b32f2f-1ab0-4965-ab19-3c345c1f0163', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Summer Beats — Hopi Hari', '8 de janeiro — não sei o preço pq o Pedro que pagou aaaaa 🎶', 0, 'done', 'Pedro', '2026-01-08'),
  ('2cd8b30d-efcb-4467-b50f-df16db3eb264', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Museu da Imigração', 'Rua Visconde de Parnaíba, 1.316, Mooca — Meia Entrada R$ 8,00', 1, 'pending', null, null),
  ('35b3ee28-097c-4ab4-8e11-eec74b1e3ab5', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Paróquia Nossa Senhora do Brasil', 'Praça Nossa Sra. do Brasil, Jardim América — Grátis', 2, 'pending', null, null),
  ('4d5fceca-b1d7-4df3-a1cd-95f265b38f86', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Mosteiro de São Bento', 'Largo São Bento, Centro Histórico — geralmente entrada gratuita', 3, 'pending', null, null),
  ('b73e5f72-9a63-4702-8611-e633d2650bb7', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'iFLY São Paulo', 'Av. Dra. Ruth Cardoso, Pinheiros — a partir de R$ 199,90 🪂', 4, 'pending', null, null),
  ('8fe3f7e6-7b87-4b95-a50d-dfcf0934e8f8', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Livraria Martins Fontes', 'Av. Paulista, 509 - Bela Vista — Gratuito 📚', 5, 'pending', null, null),
  ('d39f60bc-5ec7-4e96-a83d-e35b7e923e2a', '6bcf4ea2-9d3d-4c3e-862d-0debc71261a8', 'Padaria Italianinha', 'Rua Rui Barbosa, 121, Bela Vista 🥐', 6, 'pending', null, null),

  -- Braganca
  ('e3a6ff73-f222-4ccb-86ea-19b8df7903ab', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Andar de bicicleta ao redor do Lago do Taboão', null, 0, 'pending', null, null),
  ('f7c32b5f-5d07-42f2-850d-bc0abfc74410', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Andar a Cavalo 🐴', null, 1, 'pending', null, null),
  ('9b63efdb-2d64-4e1b-bcbb-726ff1af1275', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Tirolesa que atravessa o lago', null, 2, 'pending', null, null),
  ('12b32f2f-1ab0-4965-ab19-3c345c1f0164', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Conhecer a represa', null, 3, 'pending', null, null),
  ('2cd8b30d-efcb-4467-b50f-df16db3eb265', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Conhecer a Clara e a Luna 🐶', null, 4, 'pending', null, null),
  ('35b3ee28-097c-4ab4-8e11-eec74b1e3ab6', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Restaurante do aeroporto — almoçar', null, 5, 'pending', null, null),
  ('4d5fceca-b1d7-4df3-a1cd-95f265b38f87', 'a8385750-7170-4dbb-80df-6ceaf0fcf9d2', 'Visitar a decoração de natal na prefeitura 🎄', null, 6, 'pending', null, null),

  -- Beto Carrero
  ('b73e5f72-9a63-4702-8611-e633d2650bb8', 'c42e12e3-d731-4a4a-9b7e-9cb8c1e3cd29', 'Não quebrar a mão da Alice ✋', 'Condição #1', 0, 'pending', 'Pedro', null),
  ('8fe3f7e6-7b87-4b95-a50d-dfcf0934e8f9', 'c42e12e3-d731-4a4a-9b7e-9cb8c1e3cd29', 'Ficar com os braços erguidos 🙌', 'Condição #2', 1, 'pending', 'Pedro', null),
  ('d39f60bc-5ec7-4e96-a83d-e35b7e923e2b', 'c42e12e3-d731-4a4a-9b7e-9cb8c1e3cd29', 'Sorrir para as fotos 📸', 'Condição #3', 2, 'pending', 'Pedro', null),
  ('e3a6ff73-f222-4ccb-86ea-19b8df7903ac', 'c42e12e3-d731-4a4a-9b7e-9cb8c1e3cd29', 'Dar Gritos de Alegria 🎉', 'Condição #4', 3, 'pending', 'Pedro', null);


-- FLIGHT ALERTS
insert into public.flight_alerts (id, trip_id, origin_iata, destination_iata, departure_date, return_date, cabin, max_stops, preferred_airlines, target_price, currency, status) values
  ('6bcf4ea2-9d3d-4c3e-862d-0debc71261a9', 'b73e5f72-9a63-4702-8611-e633d2650bb7', 'GRU', 'SCL', '2026-07-13', '2026-07-27', 'economy', 1, '{"LA", "JJ", "G3"}', 200000, 'BRL', 'active');
