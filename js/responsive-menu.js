(function ( document, $, undefined ) {
	'use strict';

	var leaven    = {},
	    classes   = {
		    'mobile': 'mobile',
		    'mainMenuButton': 'menu-toggle',
		    'submenuButton': 'sub-menu-toggle',
		    'screenReader': 'screen-reader-text',
		    'activated': 'activated',
		    'open': 'open'
	    },
	    selectors = {
		    'genesis': '.genesis-nav-menu',
		    'menuItem': '.menu-item',
		    'parentMenuItem': '.menu-item-has-children',
		    'submenu': '.sub-menu',
		    'mainMenuButton': '.' + classes.mainMenuButton,
		    'submenuButton': '.' + classes.submenuButton
	    };

	leaven.init = function () {
		_addSubmenuButtons();
		_orphanedParents();
		$( window ).on( 'resize.leaven', _doResize ).triggerHandler( 'resize.leaven' );
		if ( ! leaven.params.desktop ) {
			_mainMenuButton();
		}
	};

	/**
	 * Add the submenu buttons to the navigation.
	 *
	 * @private
	 */
	function _addSubmenuButtons() {
		var submenu = $( '<button />', {
			'class': classes.submenuButton,
			'aria-expanded': false,
			'aria-pressed': false,
			'aria-label': leaven.params.subMenuAria
		} )
			.append( leaven.params.toggle )
			.append( $( '<span />', {
				'class': classes.screenReader,
				'text': leaven.params.subMenu
			} ) );
		$( 'nav ' + selectors.submenu ).before( submenu );
	}

	/**
	 * Build the mobile menu button.
	 *
	 * @private
	 */
	function _mainMenuButton() {
		var menuButton = $( '<button />', {
			'class': classes.mainMenuButton,
			'aria-expanded': false,
			'aria-pressed': false
		} )
			.append( leaven.params.button )
			.append( leaven.params.mainMenu );
		$( 'nav' + leaven.params.primary ).before( menuButton ); // add the main nav buttons
		$( selectors.mainMenuButton )
			.on( 'click.leaven-main', _mainmenuToggle )
			.each( _addClassID );
	}

	/**
	 * Add nav class and ID to related button.
	 *
	 * @private
	 */
	function _addClassID() {
		var $this = $( this ),
		    nav   = $this.next( 'nav' ),
		    id    = 'class';
		$this.addClass( $( nav ).attr( 'class' ) );
		if ( $( nav ).attr( 'id' ) ) {
			id = 'id';
		}
		$this.attr( 'id', 'mobile-' + $( nav ).attr( id ) );
	}

	/**
	 * Functions, checks on screen/browser change.
	 * @type {Function}
	 * @private
	 */
	var _doResize = _debounce( function () {
		var $buttons    = $( 'button[id^="mobile"]' ).attr( 'id' ),
		    selector    = selectors.genesis + ' ' + selectors.submenuButton,
		    genesisItem = selectors.genesis + ' ' + selectors.parentMenuItem;
		_closeSubmenus( $( selectors.genesis + ' ' + selectors.menuItem ) );
		_maybeClose();
		$( genesisItem + ',' + selector ).off();
		$( selector ).on( 'click.leaven-subbutton', _submenuToggle );
		if ( typeof $buttons === 'undefined' || 'none' === _getDisplayValue( $buttons ) ) {
			_desktopMenu( genesisItem );
		}
		if ( typeof $buttons === 'undefined' ) {
			return;
		}
		_combineMenus( $buttons );
		_mobileMenuClass( $buttons );
		_changeSkipLink( $buttons );
		_parentMenuClose( $buttons );
	}, 250 );

	/**
	 * Add the hover action to each parent menu item.
	 *
	 * @param genesisItem
	 * @private
	 */
	function _desktopMenu( genesisItem ) {
		$( genesisItem ).each( function () {
			var $this = $( this ),
			    args  = {
				    'trigger': $this.find( '> ' + selectors.submenuButton ),
				    'submenu': $this.find( '> ' + selectors.submenu ),
				    'others': $this.siblings()
			    };
			$( this ).on( 'mouseenter', args, _hoverOpen );
			$( this ).on( 'mouseleave', args, _hoverClose );
		} );
	}

	/**
	 * action to happen when the main menu button is clicked
	 */
	function _mainmenuToggle() {
		var $this = $( this );
		_doToggle( $this );
		$this.next( 'nav, ' + selectors.submenu ).slideToggle();
	}

	/**
	 * Action for submenu toggle buttons.
	 * @private
	 */
	function _submenuToggle( e ) {
		if ( e.keyCode && 13 !== e.keyCode ) {
			return;
		}

		var $this = $( this );
		_doSubMenuToggle( {
			'trigger': $this,
			'submenu': $this.next( selectors.submenu ),
			'others': $this.closest( selectors.menuItem ).siblings()
		} );
	}

	/**
	 * Submenu toggle method for opening hovered menu items.
	 *
	 * @private
	 */
	var _hoverOpen = _debounce( function ( e ) {
		if ( e.data.trigger.hasClass( classes.activated ) ) {
			return;
		}
		e.data.open        = false;
		classes.activated += ' item-hovered';
		_doSubMenuToggle( e.data );
	}, 100 );

	/**
	 * Submenu toggle method for closing hovered menu items.
	 * Closing is delayed by 800ms.
	 *
	 * @private
	 */
	var _hoverClose = _debounce( function ( e ) {
		e.data.open = true;
		_doSubMenuToggle( e.data );
	}, 1000 );

	/**
	 * Toggle the submenu buttons.
	 * @param args
	 * @private
	 */
	function _doSubMenuToggle( args ) {
		var action = 'addClass',
		    slide  = 'slideDown',
		    open   = args.open || args.trigger.hasClass( classes.activated );
		if ( open ) {
			action = 'removeClass';
			slide  = 'slideUp';
		}
		args.trigger
			.attr( 'aria-pressed', ! open )
			.attr( 'aria-expanded', ! open )
			[action]( classes.activated );
		args.submenu[slide]()[action]( classes.open );
		if ( 'addClass' === action ) {
			_closeSubmenus( args.others );
		}
	}

	/**
	 * Handle aria attributes, activated class when a button is clicked.
	 * @param $this
	 * @private
	 */
	function _doToggle( $this ) {
		_toggleAria( $this, 'aria-pressed' );
		_toggleAria( $this, 'aria-expanded' );
		$this.toggleClass( classes.activated );
	}

	/**
	 * Close all submenus.
	 * @param menus
	 * @private
	 */
	function _closeSubmenus( menus ) {
		menus.find( selectors.submenuButton )
			.removeClass( classes.activated )
			.attr( 'aria-pressed', false )
			.attr( 'aria-expanded', false );
		menus.find( selectors.submenu ).slideUp( 'fast' ).removeClass( classes.open );
	}

	/**
	 * Close submenus when a parent menu item is focused.
	 * @param buttons
	 * @private
	 */
	function _parentMenuClose( buttons ) {
		if ( 'none' !== _getDisplayValue( buttons ) ) {
			return;
		}
		$( '.genesis-nav-menu > li' + selectors.menuItem + ' > a' ).focus( function () {
			_closeSubmenus( $( selectors.menuItem ) );
		} );
	}

	/**
	 * modify skip links to match mobile buttons
	 */
	function _changeSkipLink( buttons ) {
		var startLink = 'genesis-nav',
		    endLink   = 'mobile-genesis-nav';
		if ( 'none' === _getDisplayValue( buttons ) ) {
			startLink = 'mobile-genesis-nav';
			endLink = 'genesis-nav';
		}
		$( '.genesis-skip-link a[href^="#' + startLink + '"]' ).each( function () {
			var link = $( this ).attr( 'href' );
			link = link.replace( startLink, endLink );
			$( this ).attr( 'href', link );
		} );
	}

	/**
	 * Close all open menus/submenus
	 * @private
	 */
	function _maybeClose() {
		$( '.' + classes.mainMenuButton + ', ' + selectors.submenuButton )
			.removeClass( classes.activated )
			.attr( 'aria-expanded', false )
			.attr( 'aria-pressed', false );
		$( selectors.submenu ).removeClass( classes.open );
		$( '.' + classes.mobile + ', ' + selectors.submenu ).attr( 'style', '' );
	}

	/**
	 * Combine all active menus into the nav-primary
	 * @param buttons
	 * @private
	 */
	function _combineMenus( buttons ) {
		if ( $( leaven.params.primary ).length === 0 || leaven.params.menus.length === 0 || typeof buttons === 'undefined' ) {
			return;
		}
		$.each( leaven.params.menus, function ( key, menu ) {
			if ( 'none' !== _getDisplayValue( buttons ) ) {
				$( '.nav-' + menu + ' .menu > li' ).addClass( 'moved-item-' + menu ).appendTo( leaven.params.primary + ' ul.genesis-nav-menu' );
				$( '.nav-' + menu ).hide();
			} else {
				$( '.nav-' + menu ).show();
				$( leaven.params.primary + ' ul.genesis-nav-menu > li.moved-item-' + menu ).appendTo( '.nav-' + menu + ' .menu' );
				$( '.nav-' + menu + ' .menu > li' ).removeClass( 'moved-item-' + menu );
			}
		} );
	}

	/**
	 * Add a class to the mobile menu.
	 * @param buttons
	 * @private
	 */
	function _mobileMenuClass( buttons ) {
		var action = 'removeClass';
		if ( 'none' !== _getDisplayValue( buttons ) ) {
			action = 'addClass';
		}
		$( leaven.params.primary )[action]( classes.mobile );
	}

	/**
	 * For empty link menu items, combine the link and submenu toggle into one button.
	 * @private
	 */
	function _orphanedParents() {
		var menuItem = selectors.genesis + ' ' + selectors.parentMenuItem + ' ';
		$( menuItem + '> a[href="#"], ' + menuItem + '> a:not([href])' ).each( function () {
			var $this = $( this ),
			    text  = $this.find( 'span' ).clone();
			$this.next( selectors.submenuButton )
				.prepend( text )
				.addClass( 'pseudo' )
				.removeAttr( 'aria-label' );
			$this.remove();
		} );
	}

	/**
	 * generic function to get the display value of an element
	 * @param  {id} $id ID to check
	 * @return {string}     CSS value of display property
	 */
	function _getDisplayValue( $id ) {
		var element = document.getElementById( $id ),
		    style   = window.getComputedStyle( element );
		return style.getPropertyValue( 'display' );
	}

	/**
	 * Toggle aria attributes
	 * @param  {button} $this     passed through
	 * @param  {aria-xx} attribute aria attribute to toggle
	 * @return {bool}           from _ariaReturn
	 */
	function _toggleAria( $this, attribute ) {
		$this.attr( attribute, function ( index, value ) {
			return _ariaReturn( value );
		} );
	}

	/**
	 * update aria-xx value of an attribute
	 * @param  {aria-xx} value passed from function
	 * @return {bool}
	 */
	function _ariaReturn( value ) {
		return 'false' === value ? 'true' : 'false';
	}

	/**
	 * Delay action after resize
	 * @param func
	 * @param wait
	 * @param immediate
	 * @returns {Function}
	 * @private
	 */
	function _debounce( func, wait, immediate ) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			var later = function () {
				timeout = null;
				if ( ! immediate ) {
					func.apply( context, args );
				}
			};
			var callNow = immediate && ! timeout;
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
			if ( callNow ) {
				func.apply( context, args );
			}
		};
	}

	leaven.params = typeof LeavenL10n === 'undefined' ? '' : LeavenL10n;

	if ( typeof leaven.params !== 'undefined' ) {
		leaven.init();
	}

})( document, jQuery );
