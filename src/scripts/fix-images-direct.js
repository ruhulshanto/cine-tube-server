import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Client } = pg;

const movies = [
  { slug: "dune-part-two", posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000" },
  { slug: "the-batman", posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2000" },
  { slug: "spiderman-no-way-home", posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" },
  { slug: "inception", posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2000" },
  { slug: "john-wick-4", posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000" },
  
  { slug: "a-quiet-place-day-one", posterUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=2000" },
  { slug: "joker", posterUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000" },
  { slug: "parasite", posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2000" },
  { slug: "se7en", posterUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=2000" },
  { slug: "shutter-island", posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000" },

  { slug: "oppenheimer", posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000" },
  { slug: "the-godfather", posterUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2000" },
  { slug: "forrest-gump", posterUrl: "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?q=80&w=2000" },
  { slug: "shawshank-redemption", posterUrl: "https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?q=80&w=2000" },
  { slug: "whiplash", posterUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2000" },

  { slug: "train-to-busan", posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000" },
  { slug: "crash-landing-on-you", posterUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2000" },
  { slug: "squid-game-movie", posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2000" },
  { slug: "itaewon-class", posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000" },
  { slug: "vincenzo", posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2000" },

  { slug: "the-notebook", posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000" },
  { slug: "titanic", posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2000" },
  { slug: "la-la-land", posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2000" },
  { slug: "pride-and-prejudice", posterUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=2000" },
  { slug: "your-name", posterUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000" },

  { slug: "everything-everywhere-all-at-once", posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2000" },
  { slug: "the-hangover", posterUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=2000" },
  { slug: "superbad", posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2000" },
  { slug: "step-brothers", posterUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000" },
  { slug: "crazy-rich-asians", posterUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=600", backdropUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2000" }
];

async function runDirect() {
  console.log("Starting DB Direct Override...");
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL missing!");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL (Fixing Images).");

    // Fix specifically defined movies
    for (const movie of movies) {
        const query = `
            UPDATE movies 
            SET "posterUrl" = $1, "backdropUrl" = $2
            WHERE slug = $3
            RETURNING title;
        `;
        const res = await client.query(query, [movie.posterUrl, movie.backdropUrl, movie.slug]);
        if (res.rowCount > 0) {
            console.log(`✅ Success fixing: ${res.rows[0].title}`);
        } else {
            console.log(`⚠️ Skipped (Not Found): ${movie.slug}`);
        }
    }

    // Fallback pass: Any TMDB, Cloudinary, or Empty URL gets an Unsplash replacement
    const defaultPoster = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600";
    const defaultBackdrop = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000";

    const fallbackQuery = `
        UPDATE movies
        SET "posterUrl" = $1, "backdropUrl" = $2
        WHERE "posterUrl" IS NULL 
           OR "posterUrl" LIKE '%cloudinary.com%' 
           OR "posterUrl" LIKE '%tmdb.org%'
        RETURNING title;
    `;
    const fallbackRes = await client.query(fallbackQuery, [defaultPoster, defaultBackdrop]);
    console.log(`✅ Fallback applied to ${fallbackRes.rowCount} remaining broken movies.`);

    console.log("All image URLs overwritten with 100% reliable CDNs.");
  } catch (err) {
    console.error("❌ Database Operation Failed:", err.message);
  } finally {
    await client.end();
  }
}

runDirect();
