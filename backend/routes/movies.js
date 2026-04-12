const express = require('express')
const router  = express.Router()
const Movie   = require('../models/Movie')

// ─── GET /api/movies ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { tab, language, genre, sort, search, trending, page = 1, limit = 50 } = req.query

    let query = { isActive: true }

    if (tab === 'movies') query.type = 'movie'
    else if (tab === 'shows') query.type = 'show'
    else if (tab === 'events') query.type = 'event'

    if (language && language !== 'All Languages') query.language = language
    if (genre)            query.genre    = { $in: genre.split(',') }
    if (trending === 'true') query.trending = true

    // Only use text search if index exists, otherwise use regex
    if (search) {
      query.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
      ]
    }

    let sortObj = { createdAt: -1 }
    if (sort === 'rating_high')  sortObj = { rating: -1 }
    if (sort === 'rating_low')   sortObj = { rating: 1 }
    if (sort === 'points_high')  sortObj = { pointsReward: -1 }
    if (sort === 'points_low')   sortObj = { pointsReward: 1 }
    if (sort === 'newest')       sortObj = { releaseDate: -1 }
    if (sort === 'oldest')       sortObj = { releaseDate: 1 }
    if (sort === 'trending')     sortObj = { trending: -1, rating: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Movie.countDocuments(query),
    ])

    res.json({ success: true, count: movies.length, total, page: parseInt(page), movies })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies: ' + error.message })
  }
})

// ─── GET /api/movies/trending ─────────────────────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const movies = await Movie.find({ trending: true, isActive: true }).sort({ rating: -1 }).limit(10)
    res.json({ success: true, movies })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trending.' })
  }
})

// ─── GET /api/movies/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' })
    res.json({ success: true, movie })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movie.' })
  }
})

// ─── POST /api/movies/seed ────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    // ⚠️ IMPORTANT: Drop ALL indexes first to clear the broken
    // text index that had 'language' as a text field.
    // MongoDB reserves 'language' as a special keyword in text indexes.
    try {
      await Movie.collection.dropIndexes()
      console.log('✅ Dropped all movie indexes')
    } catch (indexErr) {
      // Collection might not exist yet on first run — that's fine
      console.log('ℹ️ No indexes to drop (first run)')
    }

    // Delete all existing movies
    await Movie.deleteMany({})
    console.log('✅ Cleared movies collection')

    const seedMovies = [
      {
        title: 'Ramayan',
        genre: ['Mythology', 'Drama', 'Adventure'],
        language: 'Hindi',
        rating: 9.5,
        votes: '210K',
        duration: '3h 05m',
        releaseDate: '2026-10-23',
        poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSagMRKLXoiDbKGYM2koTUXnvd6ApIs8Hitrw&s',
        backdrop: 'https://m.media-amazon.com/images/M/MV5BOTM2OGY3YzItNTE3My00N2VjLTgwOGEtMjkzN2IwZDdjM2Y1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
        description: 'Lord Rama embarks on an epic journey of duty, honor, and sacrifice to rescue Sita and defeat the demon king Ravana, shaping the destiny of dharma.',
        cast: ['Ranbir Kapoor', 'Sai Pallavi', 'Yash', 'Sunny Deol'],
        director: 'Nitesh Tiwari',
        pointsReward: 150,
        price: { regular: 220, premium: 380, recliner: 600 },
        badge: 'EPIC',
        trending: true,
        type: 'movie',
      },
      {
        title: 'Kalki 2898 AD',
        genre: ['Action', 'Mythology'],
        language: 'Telugu',
        rating: 8.7,
        votes: '98K',
        duration: '3h 1m',
        releaseDate: '2025-11-05',
        poster: 'https://dx35vtwkllhj9.cloudfront.net/prathyangira-cinemas/kalki-2898-ad/images/regions/us/onesheet.jpg',
        backdrop: 'https://m.media-amazon.com/images/M/MV5BNDkzZjZmNTYtZjAxMC00M2U3LWEyMjctMjY2NDEwYWE1MzBmXkEyXkFqcGc@._V1_.jpg',
        description: 'In a dystopian future, a warrior is foretold to be the final avatar of Lord Vishnu, destined to end the tyrannical rule of Supreme Yaskin.',
        cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan', 'Kamal Haasan'],
        director: 'Nag Ashwin',
        pointsReward: 100,
        price: { regular: 200, premium: 350, recliner: 600 },
        badge: 'HIT',
        trending: true,
        type: 'movie',
      },
      {
        title: 'Avengers: Infinity War',
        genre: ['Action', 'Superhero'],
        language: 'English',
        rating: 8.9,
        votes: '215K',
        duration: '2h 55m',
        releaseDate: '2026-05-01',
        poster: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/03/avengers-infinity-war-poster.jpeg',
        backdrop: 'https://cdna.artstation.com/p/assets/images/images/018/256/764/large/george-britton-infinitywarposterv2.jpg?1558723043',
        description: 'Heroes from every reality must unite to face the most devastating threat the universe has ever seen.',
        cast: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson', 'Benedict Cumberbatch'],
        director: 'The Russo Brothers',
        pointsReward: 150,
        price: { regular: 300, premium: 500, recliner: 800 },
        badge: 'UPCOMING',
        trending: true,
        type: 'movie',
      },
      {
        title: 'Pushpa: The Rule',
        genre: ['Action', 'Drama'],
        language: 'Telugu',
        rating: 8.4,
        votes: '76K',
        duration: '3h 20m',
        releaseDate: '2025-08-15',
        poster: 'https://m.media-amazon.com/images/M/MV5BZjJmMjJmYWMtNTQyYy00NzcxLWE5N2EtMTY5NjRhMGZmYjNlXkEyXkFqcGc@._V1_.jpg',
        backdrop: 'https://images.fandango.com/ImageRenderer/820/0/redesign/static/img/default_poster.png/0/images/masterrepository/fandango/238502/pushpa2therule-posterart-sm.jpg',
        description: 'Pushpa Raj solidifies his empire while facing threats from all sides — the law, rivals, and his own past.',
        cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
        director: 'Sukumar',
        pointsReward: 90,
        price: { regular: 180, premium: 320, recliner: 550 },
        badge: 'SUPERHIT',
        trending: false,
        type: 'movie',
      },
      {
        title: 'RRR 2',
        genre: ['Action', 'Historical'],
        language: 'Telugu',
        rating: 8.8,
        votes: '112K',
        duration: '3h 5m',
        releaseDate: '2025-10-02',
        poster: 'https://wallpapercave.com/wp/wp10944919.jpg',
        backdrop: 'https://wallpaperaccess.com/full/7067669.jpg',
        description: 'Ram and Bheem continue their legendary fight for justice and freedom in the face of an even more powerful colonial machine.',
        cast: ['NT Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
        director: 'SS Rajamouli',
        pointsReward: 110,
        price: { regular: 220, premium: 380, recliner: 620 },
        badge: 'HIT',
        trending: false,
        type: 'movie',
      },
      {
        title: 'Mirzapur — Season 2',
        genre: ['Crime', 'Thriller', 'Drama'],
        language: 'Hindi',
        rating: 9.2,
        votes: '240K',
        duration: '48m/ep',
        releaseDate: '2024-10-03',
        poster: 'https://images.justwatch.com/poster/216332297/s718/season-2.%7Bformat%7D',
        backdrop: 'https://cdn.images.express.co.uk/img/dynamic/20/590x/secondary/Mirzapur-season-2-The-Amazon-Prime-poster-2021836.jpg?r=1567149517127',
        description: 'Guddu and Golu rise from the ashes, driven by revenge against Kaleen Bhaiya and Munna. The power struggle for Mirzapur becomes bloodier than ever.',
        cast: ['Pankaj Tripathi', 'Ali Fazal', 'Shweta Tripathi', 'Divyendu Sharma'],
        director: 'Gurmmeet Singh',
        pointsReward: 85,
        price: { regular: 179, premium: 279 },
        badge: 'FAN FAVORITE',
        trending: true,
        type: 'show',
      },
      {
        title: 'Stranger Things — Season 5',
        genre: ['Sci-Fi', 'Horror', 'Thriller'],
        language: 'English',
        rating: 9.0,
        votes: '320K',
        duration: '55m/ep',
        releaseDate: '2025-11-01',
        poster: 'https://d2cdo4blch85n8.cloudfront.net/wp-content/uploads/2025/11/Netflixs-Stranger-Things-5-Official-Poster-691x1024.jpg',
        backdrop: 'https://i.pinimg.com/736x/6c/64/8d/6c648d2ab0a2856bff80081b44c03694.jpg',
        description: 'Eleven and her friends confront Vecna in a battle that will determine the fate of the real world and the Upside Down.',
        cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour', 'Winona Ryder'],
        director: 'The Duffer Brothers',
        pointsReward: 95,
        price: { regular: 199, premium: 299 },
        badge: 'FINAL SEASON',
        trending: true,
        type: 'show',
      },
    ]

    const inserted = await Movie.insertMany(seedMovies)
    console.log(`✅ Seeded ${inserted.length} movies`)

    res.json({ success: true, message: `✅ Seeded ${inserted.length} movies/shows successfully!` })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ success: false, message: 'Seed failed: ' + error.message })
  }
})

module.exports = router