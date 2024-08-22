export const MusicPrompt = (MusicTask) => {
  return `You are a music recommendation expert. The user has described their mood and feelings as: "${MusicTask}". Based on this, recommend a selection of the top 5 songs that fit their emotional state. Provide the recommendations in an array of objects with the following properties:

  - **Song**: Title of the song.
  - **Artist**: Name of the artist or band.
  - **Genre**: Genre of the song.
  - **Album**: Album the song appears on, if applicable.
  - **Description**: Explanation of why this song fits the user's mood.
  - **Listen**: A valid URL to listen to the song on Spotify.
  - **Image**: A valid URL to the song's cover image on Spotify.

Ensure all URLs (for listening and images) are valid and lead to working pages.`
}
