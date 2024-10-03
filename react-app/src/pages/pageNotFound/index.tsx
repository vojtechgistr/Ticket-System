import {Helmet, HelmetProvider} from "react-helmet-async";
import {handleNavigationClick} from "../../common/helpers.ts";

import './index.css';

const TITLE: string = "404 | Not Found";

function PageNotFound() {
    let randomGifIndex = Math.floor(Math.random() * PageNotFoundGifs.length);
    let randomGif = PageNotFoundGifs[randomGifIndex];

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>{TITLE}</title>
                </Helmet>
            </HelmetProvider>
            <div className='not-found-container'>
                <img src={randomGif.url || '/assets/images/404_not_found.gif'} alt=""/>

                <div className='not-found-text'>

                    <h2>What are you looking for?</h2>
                    <h2><span className='not-here'>This page isn't here.</span></h2>

                    {randomGif.message}

                    <button onClick={() => handleNavigationClick('/dashboard/', '_self')}>Go to Home Page</button>
                </div>
            </div>
        </>
    );
}

export default PageNotFound;


export const PageNotFoundGifs = [
    {
        id: 1,
        url: "/assets/images/404/not_found_1.gif",
        message: <p>Anyway, thanks for this great scenery, I like to eat popcorn while watching you smash your keyboard over this <span className='error-code'>404 error</span>.</p>
    },
    {
        id: 2,
        url: "/assets/images/404/not_found_2.gif",
        message: <p>Heyy, you!! Do you know who stole my precious page? Was it an <span className='error-code'>Error 404</span>, or a thief... Either way, I'll find him!</p>
    },
    {
        id: 3,
        url: "/assets/images/404/not_found_3.gif",
        message: <p>You were trying to cross the border, right? Walked right into that <span className='error-code'>404 Error</span> didn't you? Same as us, and that thief over there.</p>
    },
    {
        id: 4,
        url: "/assets/images/404/not_found_4.gif",
        message: <p>What do I see here? Someone who's trying to cross the line? Get back here now, or you'll be consumed by <span className='error-code'>Error 404</span> and me.</p>
    },
    {
        id: 5,
        url: "/assets/images/404/not_found_5.gif",
        message: <p>Who was it? You did it, didn't you... I saw that you were having fun with the <span className='error-code'>Error 404</span>, and don't try to lie to me.</p>
    }
]