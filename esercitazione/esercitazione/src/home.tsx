import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Nav from './components/nav'
import './App.css'
import useSearchHooks from './hooks/useSearchHooks'
import ShowCard from './components/show'
import type { ShowData } from './model/model'
function App() {
  const [query, setQuery] = useState('')
  const result = useSearchHooks(query)

  return (
    <>
      <header>
        <Nav></Nav>
      </header>
      <form action="" method="get">

        <input id='query' type='text' placeholder='search show'
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
        ></input>
        <input type='submit' onSubmit={
          (e) => {
            e.preventDefault()
            useSearchHooks(query)
          }
        }></input> 
        {result.result && JSON.parse(result.result).map((show: ShowData) => <ShowCard key={show.show.id} data={show} />)}
      </form>

    </>
  )
}

export default App
