<?php
/**
 * Copyright (c) 2018 Robin Cornett
 */

add_filter( 'body_class', 'leaven_global_body_class' );
/**
 * Add custom body class to the head
 */
function leaven_global_body_class( $classes ) {
	$classes[] = 'no-js';

	return $classes;
}

add_action( 'genesis_before', 'leaven_jsnojs', 1 );
/**
 * Echo out the script that changes 'no-js' class to 'js'.
 *
 * @since 1.0.0
 */
function leaven_jsnojs() {
	?>
<script>
//<![CDATA[
(function(){
var c = document.body.classList;
c.remove( 'no-js' );
c.add( 'js' );
})();
//]]>
</script>
	<?php
}
