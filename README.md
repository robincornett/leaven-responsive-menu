# Leaven Responsive Menu

This is a project to help add a mobile first, accessible, responsive, SVG driven menu to a Genesis child theme. Fallback styling for browsers which do not support/allow JavaScript is included.

## Installation

This project consists of four elements:

1. JavaScript: the script files should be added to your theme /js folder.
2. CSS: the project includes both the Sass partials and a compiled style.css. You can add the partials to your own project and import per your workflow, or copy/paste the style.css contents into your theme stylesheet, replacing all navigation styles. Only navigation location specific styling should be needed beyond what's in this project.
3. Sprites: the sprites in the code are from the Font Awesome free SVG icons. You can use these or replace them with your own. The code in the svg.php file expects the icons to be in the /sprites folder.
4. PHP: five individual files are included, some of which are optional. You can either copy the individual files to your theme and include them, or copy the individual functions into your functions.php file.
	* `body-class.php`: preemptively adds a no-js body class to the page. This is removed using JavaScript before the page loads, to avoid styling flashes.
	* `navigation.php`: sets up the script and localization variables for the responsive menu.
	* `navigation-search.php`: adds a search input to the primary navigation menu
	* `svg.php`: function to add SVG icons to menus, search forms, etc.
	* `svg-navigation.php` : function to scan a social menu and add SVG icons automatically, if possible.

## Frequently Asked Questions

## Changelog

### 1.0.0
* initial release
