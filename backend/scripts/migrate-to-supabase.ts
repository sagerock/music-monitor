import { PrismaClient as LocalPrisma } from '@prisma/client';
import { PrismaClient as SupabasePrisma } from '@prisma/client';

const localDb = new LocalPrisma({
  datasources: {
    db: {
      url: 'postgresql://musicmonitor:musicmonitor123@localhost:5432/music_monitor'
    }
  }
});

const supabaseDb = new SupabasePrisma({
  datasources: {
    db: {
      url: 'postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb*kzd@aws-0-us-east-2.pooler.supabase.com:5432/postgres'
    }
  }
});

async function migrate() {
  console.log('Starting migration from local to Supabase...');

  try {
    // Migrate artists
    console.log('Migrating artists...');
    const artists = await localDb.artist.findMany({
      include: {
        snapshots: true,
        tracks: true,
      }
    });
    
    for (const artist of artists) {
      console.log(`Migrating artist: ${artist.name}`);
      
      // Create artist
      const createdArtist = await supabaseDb.artist.upsert({
        where: { id: artist.id },
        create: {
          id: artist.id,
          name: artist.name,
          popularity: artist.popularity,
          followers: artist.followers,
          imageUrl: artist.imageUrl,
          genres: artist.genres,
          isMajorLabel: artist.isMajorLabel,
          spotifyUrl: artist.spotifyUrl,
          createdAt: artist.createdAt,
          updatedAt: artist.updatedAt,
        },
        update: {
          name: artist.name,
          popularity: artist.popularity,
          followers: artist.followers,
          imageUrl: artist.imageUrl,
          genres: artist.genres,
          isMajorLabel: artist.isMajorLabel,
          spotifyUrl: artist.spotifyUrl,
        }
      });

      // Migrate snapshots for this artist
      if (artist.snapshots.length > 0) {
        console.log(`  Migrating ${artist.snapshots.length} snapshots...`);
        for (const snapshot of artist.snapshots) {
          await supabaseDb.snapshot.upsert({
            where: {
              artistId_snapshotDate: {
                artistId: createdArtist.id,
                snapshotDate: snapshot.snapshotDate
              }
            },
            create: {
              artistId: createdArtist.id,
              snapshotDate: snapshot.snapshotDate,
              popularity: snapshot.popularity,
              followers: snapshot.followers,
              tiktokMentions: snapshot.tiktokMentions,
              playlistCount: snapshot.playlistCount,
            },
            update: {}
          });
        }
      }

      // Migrate tracks for this artist
      if (artist.tracks.length > 0) {
        console.log(`  Migrating ${artist.tracks.length} tracks...`);
        for (const track of artist.tracks) {
          await supabaseDb.track.upsert({
            where: { id: track.id },
            create: {
              id: track.id,
              artistId: createdArtist.id,
              name: track.name,
              albumId: track.albumId,
              albumName: track.albumName,
              releaseDate: track.releaseDate,
              tempo: track.tempo,
              energy: track.energy,
              danceability: track.danceability,
              valence: track.valence,
              loudness: track.loudness,
              acousticness: track.acousticness,
              instrumentalness: track.instrumentalness,
              speechiness: track.speechiness,
              duration: track.duration,
              createdAt: track.createdAt,
            },
            update: {}
          });
        }
      }
    }

    // Migrate users
    console.log('Migrating users...');
    const users = await localDb.user.findMany({
      include: {
        watchlists: true,
        alerts: true,
        comments: true,
        ratings: true,
      }
    });

    for (const user of users) {
      console.log(`Migrating user: ${user.email}`);
      
      const createdUser = await supabaseDb.user.upsert({
        where: { email: user.email },
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          isPublic: user.isPublic,
          showActivity: user.showActivity,
          showWatchlist: user.showWatchlist,
          allowFollowers: user.allowFollowers,
          twitter: user.twitter,
          instagram: user.instagram,
          tiktok: user.tiktok,
          youtube: user.youtube,
          website: user.website,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        update: {}
      });

      // Migrate watchlists
      for (const watchlist of user.watchlists) {
        await supabaseDb.watchlist.create({
          data: {
            userId: createdUser.id,
            artistId: watchlist.artistId,
            createdAt: watchlist.createdAt,
          }
        }).catch(() => {}); // Ignore if already exists
      }

      // Migrate alerts
      for (const alert of user.alerts) {
        await supabaseDb.alert.create({
          data: {
            userId: createdUser.id,
            artistId: alert.artistId,
            threshold: alert.threshold,
            isActive: alert.isActive,
            lastTriggered: alert.lastTriggered,
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt,
          }
        }).catch(() => {}); // Ignore if already exists
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await localDb.$disconnect();
    await supabaseDb.$disconnect();
  }
}

migrate();