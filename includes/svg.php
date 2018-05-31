<?php

/**
 * Get icon output with alignment.
 * @param $icon
 *
 * @param string $align
 *
 * @return string
 */
function leaven_do_icon( $icon, $align = 'center' ) {
	return sprintf( '<div class="icon align%s">%s</div>',
		esc_attr( $align ),
		leaven_get_svg( $icon )
	);
}

/**
 * Build the string/markup for an SVG icon.
 *
 * @param $icon
 *
 * @param array $args
 *
 * @return string
 */
function leaven_get_svg( $icon, $args = array() ) {

	$defaults        = array(
		'title'    => '',
		'desc'     => '',
		'fallback' => false,
	);
	$args            = wp_parse_args( $args, $defaults );
	$aria_hidden     = ' aria-hidden="true"';
	$aria_labelledby = '';
	$title           = '';
	$fallback        = '';

	if ( $args['title'] ) {
		$aria_hidden     = '';
		$unique_id       = uniqid();
		$aria_labelledby = ' aria-labelledby="title-' . $unique_id . '"';
		$title           = sprintf( '<title id="title-%s">%s</title>',
			$unique_id,
			esc_html( $args['title'] )
		);
		if ( $args['desc'] ) {
			$aria_labelledby = ' aria-labelledby="title-' . $unique_id . ' desc-' . $unique_id . '"';
			$title          .= sprintf( '<desc id="desc-%s">%s</desc>',
				$unique_id,
				esc_html( $args['desc'] )
			);
		}
	}

	if ( $args['fallback'] ) {
		$fallback = '<span class="svg-fallback icon-' . esc_attr( $icon ) . '"></span>';
	}

	return sprintf( '<svg class="icon %1$s" role="img"%2$s%3$s>%4$s <use href="#%1$s" xlink:href="#%1$s"></use> %5$s</svg>',
		esc_attr( $icon ),
		$aria_hidden,
		$aria_labelledby,
		$title,
		$fallback
	);
}

add_action( 'wp_footer', 'leaven_include_svg_icons', 999 );
/**
 * Add SVG definitions to the footer.
 */
function leaven_include_svg_icons() {
	foreach ( array( 'fa-solid', 'fa-brands' ) as $style ) {
		$file = trailingslashit( get_stylesheet_directory() ) . 'sprites/' . $style . '.svg';
		if ( file_exists( $file ) ) {
			include_once $file;
		}
	}
}

add_filter( 'wp_kses_allowed_html', 'leaven_filter_allowed_html', 10, 2 );
/**
 * Allow SVG in wp_kses_post output.
 * @param $allowed
 * @param $context
 *
 * @return mixed
 */
function leaven_filter_allowed_html( $allowed, $context ) {

	if ( 'post' === $context ) {
		$allowed['svg'] = array(
			'class' => true,
		);
		$allowed['use'] = array(
			'xlink:href' => true,
		);
	}

	return $allowed;
}

