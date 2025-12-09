import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './nav.css'

function Nav() {
    const [count, setCount] = useState(0)

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <a href='../' target='_self'>Home</a>
                    </li>
                    <li>
                        <a href="../about">About</a>
                    </li>
                    <li>
                        <a href="../movies">Movies</a>
                    </li>
                </ul>

            </nav>

        </>
    )
}

export default Nav
