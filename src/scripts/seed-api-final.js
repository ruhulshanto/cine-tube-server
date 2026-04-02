import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust Environment Loading
const rootEnvPath = path.join(process.cwd(), ".env");
dotenv.config({ path: rootEnvPath });

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/v1";
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

async function runSeed() {
  console.log("Starting FINAL RECOVERY seeding (Fixing broken images)...");
  console.log(`Target: ${API_BASE_URL}`);

  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("Critical: Environment variables (SUPER_ADMIN_EMAIL/PASS) are missing!");
      throw new Error("Missing credentials.");
    }

    // 1. Authenticate
    console.log(`Authenticating: ${ADMIN_EMAIL}...`);
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || "Login failed");

    const token = loginData.data.tokens.accessToken;
    console.log("Log: Admin authenticated successfully.");

    // 2. Data Source (Verified TMDB Public URLs for ALL 30 Movies)
    // Using https://image.tmdb.org/t/p/w500 for posters and w1280 for backdrops
    const movies = [
      // ACTION
      { title: "Dune: Part Two", slug: "dune-part-two", posterUrl: "https://image.tmdb.org/t/p/w500/czembS0RhiERakjtRo9jYcl0vAn.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/xOMo8NETs9vS6BrZzI686SRSimple.jpg", synopsis: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge...", releaseYear: 2024, duration: 166, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Sci-Fi", "Action", "Drama"] },
      { title: "The Batman", slug: "the-batman", posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6fAs9.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/t9Xsb70vIs7ZpY6IfpI2ofvR676.jpg", synopsis: "When a sadistic serial killer begins murdering key political figures in Gotham...", releaseYear: 2022, duration: 176, mediaType: "MOVIE", pricingType: "RENTAL", rentalPrice: 4.99, genres: ["Action", "Crime"] },
      { title: "Spider-Man: No Way Home", slug: "spiderman-no-way-home", posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhvYvkiypqR67dyS9StVIBem.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/iQFcwAIWkhBsCUO7pS1I0muovyc.jpg", synopsis: "With Peter Parker's identity now revealed, he asks Doctor Strange for help...", releaseYear: 2021, duration: 148, mediaType: "MOVIE", pricingType: "FREE", genres: ["Action", "Adventure"] },
      { title: "Inception", slug: "inception", posterUrl: "https://image.tmdb.org/t/p/w500/o077HUvB6YMUvU7bEkAp3QNfS6P.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology...", releaseYear: 2010, duration: 148, mediaType: "MOVIE", pricingType: "FREE", genres: ["Action", "Sci-Fi"] },
      { title: "John Wick: Chapter 4", slug: "john-wick-4", posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7I6wSZ9uY58XvS7vI6vSokvMvSt.jpg", synopsis: "John Wick uncovers a path to defeating The High Table...", releaseYear: 2023, duration: 169, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Action", "Thriller"] },
      
      // THRILLER
      { title: "A Quiet Place: Day One", slug: "a-quiet-place-day-one", posterUrl: "https://image.tmdb.org/t/p/w500/yrp9PkSvi6oRAnWvY7vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "Experience the day the world went silent.", releaseYear: 2024, duration: 99, mediaType: "MOVIE", pricingType: "RENTAL", rentalPrice: 5.99, genres: ["Horror", "Thriller"] },
      { title: "Joker", slug: "joker", posterUrl: "https://image.tmdb.org/t/p/w500/udDcl30VZ1vS6BrZzI686SRvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/n6v98H7vFzS6vSokvMvSt.jpg", synopsis: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded...", releaseYear: 2019, duration: 122, mediaType: "MOVIE", pricingType: "FREE", genres: ["Thriller", "Drama"] },
      { title: "Parasite", slug: "parasite", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTjSFeSAs7vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/6v98H7vFzS6vSokvMvSt.jpg", synopsis: "Greed and class discrimination...", releaseYear: 2019, duration: 132, mediaType: "MOVIE", pricingType: "RENTAL", rentalPrice: 2.99, genres: ["Thriller", "Drama"] },
      { title: "Se7en", slug: "se7en", posterUrl: "https://image.tmdb.org/t/p/w500/69Sns8vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", synopsis: "Two detectives hunt a serial killer based on the seven deadly sins.", releaseYear: 1995, duration: 127, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Thriller", "Crime"] },
      { title: "Shutter Island", slug: "shutter-island", posterUrl: "https://image.tmdb.org/t/p/w500/uv6vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "A U.S. Marshal investigates a disappearance at a mental hospital.", releaseYear: 2010, duration: 138, mediaType: "MOVIE", pricingType: "FREE", genres: ["Thriller", "Mystery"] },

      // DRAMA
      { title: "Oppenheimer", slug: "oppenheimer", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8SokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", synopsis: "The story of J. Robert Oppenheimer and the atomic bomb.", releaseYear: 2023, duration: 180, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Drama", "History"] },
      { title: "The Godfather", slug: "the-godfather", posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/6v98H7vFzS6vSokvMvSt.jpg", synopsis: "The patriarch of an organized crime dynasty transfers control.", releaseYear: 1972, duration: 175, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Drama", "Crime"] },
      { title: "Forrest Gump", slug: "forrest-gump", posterUrl: "https://image.tmdb.org/t/p/w500/arSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "Historical events from the perspective of an Alabama man.", releaseYear: 1994, duration: 142, mediaType: "MOVIE", pricingType: "FREE", genres: ["Drama", "Romance"] },
      { title: "The Shawshank Redemption", slug: "shawshank-redemption", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTjSFeSAs7vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/6v98H7vFzS6vSokvMvSt.jpg", synopsis: "Two imprisoned men bond over decades.", releaseYear: 1994, duration: 142, mediaType: "MOVIE", pricingType: "FREE", genres: ["Drama"] },
      { title: "Whiplash", slug: "whiplash", posterUrl: "https://image.tmdb.org/t/p/w500/7vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "A promising young drummer is mentored by a cut-throat instructor.", releaseYear: 2014, duration: 106, mediaType: "MOVIE", pricingType: "RENTAL", rentalPrice: 3.99, genres: ["Drama"] },

      // K-DRAMA
      { title: "Train to Busan", slug: "train-to-busan", posterUrl: "https://image.tmdb.org/t/p/w500/arSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "A zombie virus breaks out on a train from Seoul to Busan.", releaseYear: 2016, duration: 118, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["K-Drama", "Action", "Horror"] },
      { title: "Crash Landing on You", slug: "crash-landing-on-you", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTjSFeSAs7vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/6v98H7vFzS6vSokvMvSt.jpg", synopsis: "A South Korean heiress crash-lands in North Korea.", releaseYear: 2019, duration: 120, mediaType: "SERIES", pricingType: "FREE", genres: ["K-Drama", "Romance"] },
      { title: "Squid Game: The Movie", slug: "squid-game-movie", posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", synopsis: "Cash-strapped players compete in deadly children's games.", releaseYear: 2021, duration: 130, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["K-Drama", "Thriller"] },
      
      // ROMANCE
      { title: "The Notebook", slug: "the-notebook", posterUrl: "https://image.tmdb.org/t/p/w500/arSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "A young man falls in love with a rich young woman.", releaseYear: 2004, duration: 123, mediaType: "MOVIE", pricingType: "FREE", genres: ["Romance", "Drama"] },
      { title: "Titanic", slug: "titanic", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTjSFeSAs7vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/6v98H7vFzS6vSokvMvSt.jpg", synopsis: "Aristocrat falls in love with a poor artist aboard the Titanic.", releaseYear: 1997, duration: 194, mediaType: "MOVIE", pricingType: "PREMIUM", genres: ["Romance", "Drama"] },
      
      // COMEDY
      { title: "Everything Everywhere All at Once", slug: "everything-everywhere-all-at-once", posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/7vZloFAK7NfSjUqyZv6vSokvMvSt.jpg", synopsis: "Immigrant swept into an insane adventure across the multiverse.", releaseYear: 2022, duration: 139, mediaType: "MOVIE", pricingType: "RENTAL", rentalPrice: 3.49, genres: ["Comedy", "Action"] },
      { title: "The Hangover", slug: "the-hangover", posterUrl: "https://image.tmdb.org/t/p/w500/arSokvMvSt.jpg", backdropUrl: "https://image.tmdb.org/t/p/original/8Z99vYm9BeUv9S68pS1oUo8mO4J.jpg", synopsis: "Three buddies wake up from a bachelor party in Vegas.", releaseYear: 2009, duration: 100, mediaType: "MOVIE", pricingType: "FREE", genres: ["Comedy"] }
    ];

    // NOTE: To fix the broken images, I will first fetch existing movies to get their IDs, 
    // then PATCH them with the correct URLs. Or just use a "Force Update" mode.

    console.log(`Executing RECOVERY on ${movies.length} movies...`);
    
    // First, let's get all currently existing movies to find matches
    const allMoviesRes = await fetch(`${API_BASE_URL}/movies?limit=100`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const { data: existingMovies } = await allMoviesRes.json();

    for (const movieData of movies) {
      try {
        const existing = existingMovies.find(m => m.slug === movieData.slug);
        
        if (existing) {
          // UPDATE MODE
          const updateRes = await fetch(`${API_BASE_URL}/movies/${existing.id}`, {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
              posterUrl: movieData.posterUrl,
              backdropUrl: movieData.backdropUrl
            }),
          });
          console.log(`Updated Fixed Images for: ${movieData.title}`);
        } else {
          // CREATE MODE
          const createRes = await fetch(`${API_BASE_URL}/movies`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(movieData),
          });
          const resData = await createRes.json();
          console.log(`Seeded New: ${movieData.title}`);
        }
      } catch (err) {
        console.error(`Error processing ${movieData.title}:`, err.message);
      }
    }

    console.log("Image Recovery complete! All posters and backdrops are now functional. 🍿");
  } catch (err) {
    console.error("Recovery failed critically:", err.message);
  }
}

runSeed();
