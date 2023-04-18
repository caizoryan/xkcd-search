import { createResource, Component, createSignal, For } from "solid-js";

import "./style.css";

// results from search
async function fetchResults(prompt: string) {
  return (
    await fetch(`http://localhost:8080/search?q=${prompt}&autocorrect=true`)
  ).json();
}

// comic data
async function fetchComic(id: number) {
  return (await fetch(`https://getxkcd.vercel.app/api/comic?num=${id}`)).json();
}

let inputBox: HTMLInputElement;
const [prompt, setPrompt] = createSignal(""); // upon pressing search
const [tempPrompt, setTempPrompt] = createSignal(""); // suggestions as you type
const [results] = createResource(prompt, fetchResults);
const [data, setData] = createSignal<Array<any>>([]);
const [suggestions] = createResource(tempPrompt, suggestWords);

function handleSearch(prompt: string) {
  setPrompt(prompt);
  setData([]);
  updateData(results);
}

function updateData(results: any) {
  if (results.loading) {
    setTimeout(() => {
      updateData(results);
    }, 100);
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

async function suggestWords(prompt: string) {
  if (prompt.length > 0)
    return (
      await fetch(`http://localhost:8080/suggest?q=${prompt}&autocorrect=true`)
    ).json();
  else return [""];
}

const App: Component = () => {
  return (
    <>
      <div style="display: flex">
        <input
          ref={inputBox}
          type="text"
          onInput={(e) => setTempPrompt(e.currentTarget.value)}
        ></input>
        <button
          onClick={() => {
            handleSearch(inputBox.value);
          }}
        >
          Search
        </button>
      </div>
      <div>
        <For each={suggestions()}>
          {(word) => (
            <button class="suggestions" onClick={() => handleSearch(word)}>
              {word}
            </button>
          )}
        </For>
      </div>
      <div class="container">
        <div class="semi-container">
          <For each={data()}>
            {(comic, i) => {
              if (i() % 2 === 0)
                return (
                  <div class="comic-box">
                    <p>{comic.title}</p>
                    <img src={comic.img}></img>
                  </div>
                );
            }}
          </For>
        </div>
        <div class="semi-container">
          <For each={data()}>
            {(comic, i) => {
              if (Math.abs(i() % 2) === 1)
                return (
                  <div class="comic-box">
                    <p>{comic.title}</p>
                    <img src={comic.img}></img>
                  </div>
                );
            }}
          </For>
        </div>
      </div>
    </>
  );
};

export default App;
