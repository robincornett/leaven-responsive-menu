<?php

// Add support for Genesis accessibility (2.2.0), but not Superfish
add_theme_support( 'genesis-accessibility', array( 'search-form', 'skip-links', 'headings' ) );

add_action( 'wp_enqueue_scripts', 'leaven_responsive_navigation', 15 );
/**
 * Responsive navigation.
 */
function leaven_responsive_navigation() {
	$minify = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
	wp_enqueue_script( 'leaven-responsive-menu', get_stylesheet_directory_uri() . "/js/responsive-menu{$minify}.js", array( 'jquery' ), CHILD_THEME_VERSION, true );
	wp_localize_script( 'leaven-responsive-menu', 'LeavenL10n', leaven_get_navigation_localization_args() );
}

/**
 * Get the localization args for our responsive menu.
 *
 * @return array
 */
function leaven_get_navigation_localization_args() {
	// optional: set the menu script to perform on desktop only. set to false to use the mobile menu, too
	$desktop_only = (bool) function_exists( 'supersideme_has_content' ) && supersideme_has_content();

	return array(
		'mainMenu'    => __( 'Menu', 'leaven-responsive-menu' ),
		'subMenu'     => __( 'Menu', 'leaven-responsive-menu' ),
		'subMenuAria' => __( 'sub-menu toggle', 'leaven-responsive-menu' ),
		'primary'     => '.nav-primary',
		'menus'       => leaven_get_secondary_menus(),
		'button'      => leaven_get_svg( 'bars' ),
		'toggle'      => leaven_get_svg( 'chevron-down' ),
		'desktop'     => $desktop_only,
	);
}

/**
 * Define which menus should be considered secondary (added to the primary menu).
 *
 * @return array
 */
function leaven_get_secondary_menus() {
	$primary_menu    = 'primary';
	$menus           = get_registered_nav_menus();
	$secondary_menus = array();
	foreach ( $menus as $location => $description ) {
		if ( has_nav_menu( $location ) && $primary_menu !== $location ) {
			$secondary_menus[] = $location;
		}
	}

	return $secondary_menus;
}

add_filter( 'nav_menu_css_class', 'leaven_remove_has_children_class', 10, 4 );
/**
 * If a menu has limited the depth and we're over that, don't add the parent item class.
 *
 * @param $classes
 * @param $item
 * @param $args
 * @param $depth
 *
 * @return mixed
 */
function leaven_remove_has_children_class( $classes, $item, $args, $depth ) {
	if ( 1 !== $args->depth ) {
		return $classes;
	}
	if ( in_array( 'menu-item-has-children', $classes, true ) ) {
		foreach ( $classes as $key => $class ) {
			if ( 'menu-item-has-children' === $class ) {
				unset( $classes[ $key ] );
			}
		}
	}

	return $classes;
}
