<?php

add_filter( 'wp_nav_menu_items', 'leaven_nav_search', 10, 2 );
/**
 * Add search form to secondary nav
 * @param $items
 * @param $args
 *
 * @return string
 */
function leaven_nav_search( $items, $args ) {
	if ( 'primary' !== $args->theme_location ) {
		return $items;
	}

	return $items . '<li class="menu-item search">' . get_search_form( false ) . leaven_get_svg( 'search' ) . '</li>';
}
