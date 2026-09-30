# FarmMarket API Connection

The app uses fixed backend routes. MongoDB stays behind the Express API, so connecting or changing the database does not require changing the frontend routes.

## Base URL

Set `EXPO_PUBLIC_API_URL` to the backend base URL ending in `/api`.

- Local development: copy `.env.example` to `.env`. Native development builds discover the Expo host automatically when the variable is omitted.
- Production: set `EXPO_PUBLIC_API_URL` in the build environment to the permanent HTTPS backend URL, such as `https://api.your-domain.ng/api`. Production builds reject localhost, missing URLs, and non-HTTPS URLs.

The actual deployed hostname must be supplied after the backend is hosted; it cannot be made permanent from the frontend alone.

## Deploying the Backend

The repository root includes a Render Blueprint for the Express API. Push the repository to a Git provider, create a Render Blueprint from that repository, and provide the MongoDB Atlas connection string when Render prompts for `MONGODB_URI`. In Atlas, allow the Render service to reach the cluster; use a narrowly scoped IP range or a paid static-egress setup where available rather than leaving database access open to the internet. Render generates `JWT_SECRET` for the service.

After Render reports the API healthy, set `EXPO_PUBLIC_API_URL` in the frontend production build environment to `https://<render-service>.onrender.com/api`, export the web app again, and deploy it to Expo Hosting. The current Expo production deployment does not yet have this URL embedded, so marketplace, registration, login and messaging requests are not usable from the public site until that rebuild is deployed.

## Stable Routes

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `name`, `email` or `phone`, `password`, `role` | `{ token, user }` |
| `POST` | `/auth/login` | `email` or `phone`, `password` | `{ token, user }` |
| `GET` | `/listings` | Optional `crop`, `latitude`, `longitude`, `radiusKm` query parameters | `{ listings }` |
| `POST` | `/listings` | Crop, quantity, price, description, GeoJSON `location` | `{ listing }` |
| `GET` | `/locations/search` | `q` place name, limited to Nigerian results | `{ locations, attribution }` |
| `POST` | `/payments/initialize` | Payment initialization payload | Provider response when configured |
| `GET` | `/messages` | Authenticated participant | `{ conversations }` |
| `POST` | `/messages` | Authenticated `{ listingId, body }` | Starts or continues a buyer/farmer conversation |
| `GET` | `/messages/listing/:listingId` | Authenticated buyer | Existing conversation for this listing, if any |
| `GET` | `/messages/:conversationId` | Authenticated participant | Conversation and its latest 200 messages |
| `POST` | `/messages/:conversationId/messages` | Authenticated `{ body }` | Sends a message to a conversation participant |

GeoJSON coordinates are `[longitude, latitude]`. Authenticated requests send `Authorization: Bearer <token>`.

## Location Search

The backend proxies place searches to the public Photon service, which uses OpenStreetMap data. No provider API key is required. Search is limited to Nigerian locations; choosing a result supplies coordinates to nearby-market search or a farm listing. Device GPS remains available as an alternative. Location results display OpenStreetMap attribution in the app. The public Photon endpoint has no availability guarantee, so a production deployment with higher traffic should use a managed geocoding provider or self-host Photon.

## Sign-In Session

Successful registration and sign-in save the returned token and user. The app uses Expo SecureStore on Android/iOS and browser local storage on web, restores the saved session on launch, and clears it on sign-out.

The payment route is currently a backend placeholder. Do not accept real payments until a provider and escrow flow are implemented server-side.

Messaging requires a MongoDB connection. Conversations are private to their buyer and farmer participants; inbox entries show unread counts, and an open thread refreshes every five seconds.