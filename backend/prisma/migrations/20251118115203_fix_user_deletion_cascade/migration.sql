-- AlterTable: Add cascade delete to watchlists
ALTER TABLE "watchlists" DROP CONSTRAINT "watchlists_user_id_fkey";
ALTER TABLE "watchlists" DROP CONSTRAINT "watchlists_artist_id_fkey";

ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_artist_id_fkey"
  FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add cascade delete to alerts
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_user_id_fkey";
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_artist_id_fkey";

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_artist_id_fkey"
  FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add set null on delete to artist_socials
ALTER TABLE "artist_socials" DROP CONSTRAINT "artist_socials_added_by_fkey";

ALTER TABLE "artist_socials" ADD CONSTRAINT "artist_socials_added_by_fkey"
  FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
