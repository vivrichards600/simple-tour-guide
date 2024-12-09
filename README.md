# simple-tour-guide

This app is designed to guide people on their phones to nearby places of interest.

As the user wonders with the app open, nearby places are shown to them along with an arrow in the direction and an estimated distance/time to walk until they get there.

Live demo: [https://tour-examplenetlify.app/](https://tour-example.netlify.app/)

## Configuration
* [app.config.json](app.config.json) - specify the name and description to display on the page
* [places/places.js](places/places.js) - specify the places to be discovered
* `places/images` - place images here of the places to be discovered

Additionally, rather than manage `places.js` manually, you can use the `manage-places.html` page to capture places as you roam and export to a `places.js` file to then use in the app.

Live demo: [https://tour-example.netlify.app/manage-places.html](https://tour-example.netlify.app/manage-places.html)

> This is very rough and ready so please use at your own risk. 
