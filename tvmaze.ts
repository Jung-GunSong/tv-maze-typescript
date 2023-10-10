import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodeButton = $(".Show-getEpisodes")

const TV_MAZE_URL = "https://api.tvmaze.com/";

const DEFAULT_IMG_URL = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

interface Show{
  id:number;
  name:string;
  summary:string;
  image:string; //TODO: add default image URL
}

// interface ShowSearchResp{
//   shows: [];
// }

interface ShowData{
  score: number;
  show: ShowDetails;
}

interface ShowDetails{
    id: number;
    name:string;
    summary: string
    image: ShowImage;
}

interface ShowImage{
  original:string;
  medium:string;
}

async function searchShowsByTerm(term:string):Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]

  const response  = await fetch(`${TV_MAZE_URL}search/shows?q=${term}`);
  const data = await response.json() as ShowData[];
  console.log(`our parsed data is`, data);



  const showArray: Show[] = data.map( (data: ShowData) => ({id: data.show.id, name: data.show.name,
                                      summary: data.show.summary, image: data.show.image.original || DEFAULT_IMG_URL }));

  console.log(`our array of shows are `, showArray);
  return showArray;


}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" id=${show.id}>
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay():Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

interface Episode{
  id:number;
  name:string;
  season:number;
  number:number;
}

interface EpisodeData{
  id:number;
  name:string;
  season:number;
  number:number;
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id:number):Promise<Episode[]> {


  const response  = await fetch(`${TV_MAZE_URL}shows/${id}/episodes`);
  const data = await response.json() as EpisodeData[];




  const episodeArray: Episode[] = data.map( (data: EpisodeData) => ({id: data.id, name: data.name,
                                      season: data.season, number: data.number }));

  return episodeArray;


}



/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }
function populateEpisodes(episodes: Episode[]): void {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
        `<div data-show-id="${episode.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <div class="media-body">
             <h5 class="text-primary">${episode.name}</h5>
             <div><small>Season ${episode.season}</small></div>
             <div><small>Episode ${episode.number}</small></div>
           </div>
         </div>
       </div>
      `);

    $episodesArea.append($episode);  }
}

async function searchForEpisodeAndDisplay():Promise<void> {
  const iDNumber = Number($episodeButton.attr("id"));
  const episodes = await getEpisodesOfShow(iDNumber);

  $episodesArea.show();
  populateEpisodes(episodes);
}

$episodeButton.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForEpisodeAndDisplay();
});