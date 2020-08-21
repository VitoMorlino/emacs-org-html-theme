$( document ).ready(function() {

    // Number of currently-active depth-levels to show in the Table of Contents panel
    const tocActiveDepthToShow = -1; /* depth of -1 means show infinite levels */

    tocSetup();
    tocRefresh();

    $( document ).scroll(function() {
	tocRefresh();
    });



    //-------------------------------------------------//
    //----------- GENERAL UTILITY FUNCTIONS -----------//
    //-------------------------------------------------//

    // Add a class to an element, optionally removing an existing class
    function addClass(element, classToAdd, classToRemove=null) {
	if (!element || !classToAdd) {
	    console.error('missing element or classToAdd');
	    return null;
	}

	if (!element.classList.contains(classToAdd)) {
	    element.classList.add(classToAdd);
	}

	if (classToRemove) {
	    element.classList.remove(classToRemove);
	}

	return element;
    }

    // Set the ID of an element, optionally removing/replacing existing ID(s)
    function setID(element,
		   idToSet,
		   shouldRemoveOtherElemMatchingID=false,
		   shouldReplaceThisElemExistingID=false) {

	if (!element || !idToSet) {
	    console.error('missing element or idToSet');
	    return;
	}

	const prevExisting = document.getElementById(idToSet);

	if (prevExisting) {
	    if (prevExisting === element) {
		console.log('element already has that ID :) - aborting setID()');
		return element;
	    }

	    if (shouldRemoveOtherElemMatchingID) {
		prevExisting.removeAttribute('id');
	    } else {
		console.warn('Another element already has this ID - aborting setID()');
		return element;
	    }
	}

	if (element.hasAttribute('id') && !shouldReplaceThisElemExistingID) {
	    console.warn('element already has an ID set - aborting setID()');
	    console.warn('existing ID = ' + element.id);
	    return element;
	}

	element.id = idToSet;
	return element;
    }



    //---------------------------------------------------------//
    //----------- TABLE OF CONTENTS SETUP FUNCTIONS -----------//
    //---------------------------------------------------------//

    function tocSetup() {
	tocSetupScrollspy();
	tocSetupHeadingClasses();
    }

    // Add classes to heading elements
    function tocSetupHeadingClasses() {

	function getDepth(element, currentDepth=0) {
	    const elemParent = tocGetParent(element);
	    if (elemParent) {
		return getDepth(elemParent, currentDepth + 1);
	    } else {
		return currentDepth;
	    }
	}

	for (const elem of document.querySelectorAll('#table-of-contents ul')) {
	    const depth = getDepth(elem);
	    elem.classList.add('toc');
	    elem.classList.add('toc-depth-' + depth);
	    elem.setAttribute('data-toc-depth', depth);
	}
    }

    // Add required classes and style for ScrollSpy to function properly
    function tocSetupScrollspy() {
	// ScrollSpy from Bootstrap 4.5.0 requires nav classes such as ".nav", ".nav-item", ".nav-link"
	$('#text-table-of-contents ul').addClass('nav');
	$('.nav li a').addClass('nav-link');

	$('body').scrollspy({target: '#text-table-of-contents'})
	    .css("position","relative"); // ScrollSpy requires position:relative on the spied-on element

	// activate.bs.scrollspy is triggered every time scrollspy makes an element .active
	$( window ).on('activate.bs.scrollspy', function(event, active) {
	    tocRefresh();
	});

    }



    //---------------------------------------------------//
    //----------- TABLE OF CONTENTS FUNCTIONS -----------//
    //---------------------------------------------------//

    // Call all functions related to updating/updated table of contents active elements
    //// This will be called on every scroll event
    function tocRefresh() {
	const activeHeadings = document.getElementsByClassName('active');
	tocSetVisibilityClasses(activeHeadings, tocActiveDepthToShow);
	tocSetActiveElementIDs(activeHeadings);
    }

    // Add visible/hidden classes to elements for the css to handle their visibility
    function tocSetVisibilityClasses(activeHeadings,
				     depthToShow=-1,
				     shouldShowChildren=true) {

	for ( const elem of document.getElementsByClassName('toc') ) {
	    // Hide all toc items at depth-1 and deeper (only show top-level headlines)
	    if ( elem.getAttribute('data-toc-depth') >= 1 ) {
		tocSetElemVisibility( elem, false );
	    }
	}

	for (const heading of activeHeadings) {
	    const headingParent = tocGetParent( heading );
	    const depthLevel = parseInt( headingParent.getAttribute('data-toc-depth') );

	    // Show current active heading
	    if ( depthToShow <= -1 || depthLevel <= depthToShow - 1 ) {
		tocSetElemVisibility( headingParent, true );
	    }

	    // Show children of active heading
	    if (shouldShowChildren && ( depthToShow <= -1 || depthLevel + 1 <= depthToShow - 1 )) {
		tocSetElemVisibility( heading.nextElementSibling, true );
	    }
	}
    }

    // Add IDs to elements that are currently active
    function tocSetActiveElementIDs(activeHeadings) {
	// Clear existing IDs
	const tocActiveIDs = ['toc-active-current',
			    'toc-active-current-level',];
	for (const activeID in tocActiveIDs) {
	    const elementWithActiveID = document.getElementById( tocActiveIDs[activeID] );
	    if (elementWithActiveID) {
		elementWithActiveID.removeAttribute('id');
	    }
	}

	// Get current active element
	for (const heading of activeHeadings) {
	    const currentLevel = tocGetParent( heading );
	    const depthLevel = parseInt( currentLevel.getAttribute('data-toc-depth') );

	    // Set toc-active-- IDs
	    if (depthLevel === activeHeadings.length - 1) {
		setID(heading, 'toc-active-current', true, false);
		setID(currentLevel, 'toc-active-current-level', true, false);
	    }
	}

    }


    //-----------------------------------------------------------//
    //----------- TABLE OF CONTENTS UTILITY FUNCTIONS -----------//
    //-----------------------------------------------------------//

    // Set an element's visible/hidden class
    function tocSetElemVisibility(element, shouldBeVisible=true) {
	if (!element) {
	    return null;
	}

	if (shouldBeVisible) {
	    // add visible class and remove hidden class
	    addClass(element, 'toc-elem-visible', 'toc-elem-hidden');
	} else {
	    // add hidden class and remove visible class
	    addClass(element, 'toc-elem-hidden', 'toc-elem-visible');
	}

	return element;
    }

    // Get an element's parent unordered-list element
    function tocGetParent(element) {
	if(!element) {
	    console.error('element to get parent of is null');
	    return null;
	}

	const elemParent = element.parentNode;

	if (!elemParent) {
	    return null;
	}

	if (elemParent.tagName === 'UL') {
	    return elemParent;
	} else {
	    return tocGetParent(elemParent);
	}
    }

});
