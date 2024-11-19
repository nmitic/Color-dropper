## How to start the project

- Install dependencies by running `npm install`
- Start the dev server `npm run dev`
- Note the Local: link in the CLI, most likely something like this http://localhost:5173/Color-dropper/ 

## Notes about the approach
- As we are not always in a position to use new flashy FE libs I took a time to build something in so called Vanilla js (or better said TS)
- Loosely coupled components are always a good idea, situation might change and we might want to use React for our UI. In which case only the UI layer can be refactored without touching any canvas logic.
- Canvas.ts is only responsible for dispatching event with a payload of mouse pointer surrounding pixels, and ofc image loading/drawing or whatever else is needed.
- ColorDropper written in Vanilla js but could have been written in any other way, will listen to dispatched event from the canvas and build magnifier and all the rest of the UI logic.

## What is not so great about it?
- One can say that we might want to show many more pixels in the magnifier, which is where we will be hitting an issue with dom manipulations as each time we update magnifier we are causing reflow. So really this, solution only works if we keep the amount of pixels in a magnifier moderate amount. If such feature is to be requested, magnifiers pixels logic should be moved in the canvas logic.
- Having in mind that great performance always comes with a trade off, with the solution presented we are not caring about the canvas complexity, image can be as big as it can, however magnifier pixel amount are to be cared for. As of now resolution of 99 x 99 works smooth in my local favorable conditions.