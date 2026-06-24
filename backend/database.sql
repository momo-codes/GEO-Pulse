-- 1. USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. NEIGHBORHOODS
CREATE TABLE neighborhoods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. NEIGHBORHOOD MEMBERS (junction: users + neighborhoods)
CREATE TABLE neighborhood_members (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  neighborhood_id INT REFERENCES neighborhoods(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 4. EVENTS
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date TIMESTAMP,
  location VARCHAR(200),
  neighborhood_id INT REFERENCES neighborhoods(id) ON DELETE CASCADE,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. EVENT ATTENDEES (junction: users + events)
CREATE TABLE event_attendees (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 6. CONTRIBUTIONS
CREATE TABLE contributions (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  type VARCHAR(50),
  value TEXT,
  description TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. POSTS (discussion inside events)
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. COMMUNITY POSTS (feed: news, help, alerts)
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  neighborhood_id INT REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. ALERTS
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  neighborhood_id INT REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  type VARCHAR(50),
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  message TEXT NOT NULL,
  reference_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);