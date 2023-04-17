import { createResource, Component, createSignal, For } from "solid-js";

import "./style.css";

async function fetchResults(prompt: string) {
  return (
    await fetch(`http://localhost:8080/search?q=${prompt}&autocorrect=true`)
  ).json();
}

async function fetchComic(id: number) {
  return (await fetch(`https://getxkcd.vercel.app/api/comic?num=${id}`)).json();
}

let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal("");
const [results] = createResource(prompt, fetchResults);
const [data, setData] = createSignal<Array<any>>([]);

function handleSearch(prompt: string) {
  setPrompt(prompt);
  setData([]);
  updateData(results);
}

function updateData(results: any) {
  if (results.loading) {
    setTimeout(() => {
      updateData(results);
    }, 500);
  } else if (results.state === "ready") {
    for (const x of results()) {
      fetchComic(x.ComicNum).then((res) => {
        setData((prev) => [...prev, res]);
        getExplain(x.ComicNum, res.title);
      });
    }
  } else {
    console.log(results);
  }
}

function getExplain(id: number, title: string) {
  title = title.replace(" ", "_");
  console.log(title);
  let url = `https://www.explainxkcd.com/wiki/api.php?action=parse&page=${id}:_${title}&origin=*&format=json`;
  fetch(url)
    .then((res) => res.json())
    .then((res) => console.log(res));
}

const App: Component = () => {
  return (
    <div>
      <input ref={inputBox} type="text"></input>
      <button
        onClick={() => {
          handleSearch(inputBox.value);
        }}
      >
        Search
      </button>
      <div class="container">
        <For each={data()}>
          {(comic) => (
            <div class="comic-box">
              <p>{comic.title}</p>
              <img src={comic.img}></img>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
