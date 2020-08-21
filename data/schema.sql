DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255) UNIQUE,
  formatted_query VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7)
);