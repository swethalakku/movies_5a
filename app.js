const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbDirectorsObjectToResponseObject = (dbDirectorsObject) => {
  return {
    directorId: dbDirectorsObject.director_id,
    directorName: dbDirectorsObject.director_name,
  };
};

// Get Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Add Movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = ` 
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)
        VALUES(
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//Update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
    `;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
     DELETE 
     FROM movie
     WHERE movie_id = ${movieId}
     ;`;
  const dbResponse = await db.run(deleteMovieQuery);
  convertDbObjectToResponseObject(dbResponse);
  response.send("Movie Removed");
});

//GET Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT director_id,
            director_name
    FROM director
    ORDER BY director_id`;
  const directors = await db.all(getDirectorsQuery);

  response.send(
    directors.map((eachDirector) =>
      convertDbDirectorsObjectToResponseObject(eachDirector)
    )
  );
});

//GET Movie Names API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId}
    
    `;
  const movieName = await db.all(getMovieNamesQuery);
  response.send(
    movieName.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
