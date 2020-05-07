"using strict";

const API_KEY = 'iP2ugi4PIvfRrZBUEDAIKxlsFjL06reev4kzcdHd';
const BASE_URL = 'https://developer.nps.gov/api/v1';
const PARKS_ENDPOINT = `${BASE_URL}/parks`;

const STATE_ABBRS = {
	"ALABAMA": "AL",
	"ALASKA": "AK",
	"ARIZONA": "AZ",
	"ARKANSAS": "AR",
	"CALIFORNIA": "CA",
	"COLORADO": "CO",
	"CONNECTICUT": "CT",
	"DELAWARE": "DE",
	"FLORIDA": "FL",
	"GEORGIA": "GA",
	"HAWAII": "HI",
	"IDAHO": "ID",
	"ILLINOIS": "IL",
	"INDIANA": "IN",
	"IOWA": "IA",
	"KANSAS": "KS",
	"KENTUCKY": "KY",
	"LOUISIANA": "LA",
	"MAINE": "ME",
	"MARYLAND": "MD",
	"MASSACHUSETTS": "MA",
	"MICHIGAN": "MI",
	"MINNESOTA": "MN",
	"MISSISSIPPI": "MS",
	"MISSOURI": "MO",
	"MONTANA": "MT",
	"NEBRASKA": "NE",
	"NEVADA": "NV",
	"NEW HAMPSHIRE": "NH",
	"NEW JERSEY": "NJ",
	"NEW MEXICO": "NM",
	"NEW YORK": "NY",
	"NORTH CAROLINA": "NC",
	"NORTH DAKOTA": "ND",
	"OHIO": "OH",
	"OKLAHOMA": "OK",
	"OREGON": "OR",
	"PENNSYLVANIA": "PA",
	"RHODE ISLAND": "RI",
	"SOUTH CAROLINA": "SC",
	"SOUTH DAKOTA": "SD",
	"TENNESSEE": "TN",
	"TEXAS": "TX",
	"UTAH": "UT",
	"VERMONT": "VT",
	"VIRGINIA": "VA",
	"WASHINGTON": "WA",
	"WEST VIRGINIA": "WV",
	"WISCONSIN": "WI",
	"WYOMING": "WY",
	"GUAM": "GU",
	"PUERTO RICO": "PR",
	"VIRGIN ISLANDS": "VI"
}

const STATE_NAMES = Object.fromEntries( Object.entries( STATE_ABBRS ).map( ([k, v]) => [v, k] ) );

let TIMER;

function formatQueryParams( params ) {
	return Object.keys( params ).map( p => `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`).join('&');
}

function stateAbbr( state ) {
	if ( Object.values( STATE_ABBRS ).includes( state.toUpperCase() ) ) {
		return state.toUpperCase();
	} else if ( STATE_ABBRS.hasOwnProperty( s.toUpperCase() ) ) {
		return STATE_ABBRS[s.toUpperCase()];
	}
}

function titleCase( input ) {
	let words = input.split(/\s+/);
	console.log(words);
	words.forEach( ( word, i ) => {
		words[i] = word[0].toUpperCase() + word.slice(1).toLowerCase();
	})
	return words.join(' ');
}

function getParksInState( state ) {
	const headers = new Headers( { "Authorization": API_KEY } );
	let input = state.split(',');
	input.forEach( (s, i) => { input[i] = s.trim().toUpperCase() } );
	console.log( input );
	let states = [];
	input.forEach( s => { 
		if ( STATE_NAMES.hasOwnProperty( s.toUpperCase() ) ) {
			states.push( s.toUpperCase() );
		} else if ( STATE_ABBRS.hasOwnProperty( s.toUpperCase() ) ) {
			states.push( STATE_ABBRS[s.toUpperCase()] );
		}
	});
	console.log( states );
	if ( states.length == 0 ) {
		$('#results').html( `<p class="results-error center-text">No valid states provided</p>`);
		return;
	}
	const params = { 
		"stateCode": states.join(','), 
		"api_key": API_KEY,
		/* "limit": 5,
		"start": 1 */
	}
	console.log( params );
	$('#results').html( `<div class="results-pending center-text">
						   <p>
						      Searching for parks in 
							  <span class="comma-list">${states.map( abbr => titleCase( STATE_NAMES[abbr] ) ).join('</span><span class="comma-list">')}</span>
						   </p>
						   <p>This can take a few moments</p>
						   ${ progressBar( 40 )}
						</div>`);
	if ( TIMER ) {
		clearInterval( TIMER );
	}
	TIMER = startProgressBar( 10, 50 );
	fetch( `${PARKS_ENDPOINT}?${formatQueryParams( params ) }`).
		then( response => {
			if ( !response.ok ) {
				throw new Error(response.statusText);
			}
			return response.json();
		}).then( responseJson => { 
			console.log(responseJson);
			let html = '';
			responseJson.data.forEach( d => {
				html += `<li><h2>${d.name}</h2>`
				pAddr = d.addresses.find( addr => { return addr.type.localeCompare("Physical") === 0 } );
				// If there wasn't a physical address in the addresses array, don't worry about it...
				if ( pAddr ) {
					let addrVals = [];
					for ( let i = 1 ; i <= 3 ; i++ ) {
						if ( pAddr[`line${i}`] ) {
							addrVals.push( pAddr[`line${i}`] );
						}
					}
					addrVals.push( pAddr.city, pAddr.stateCode, pAddr.postalCode );
					html += `<p>${addrVals.join(' / ')}</p>`;
				}
				html += `<div><a href="${d.url}">${d.url}</a><div><p>${d.description}</p></li>`;
			});
			clearInterval( TIMER );
			$('#input-state-submit').prop('disabled', false);
			$('#input-state').prop('disabled', false);
			$('#results').html( `<ul>${html}</ul>` );
		}).catch( error => {
			clearInterval( TIMER );
			$('#input-state-submit').prop('disabled', false);
			$('#input-state').prop('disabled', false);
			$('#results').html( `<p class="results-error center-text">${error}</p>`);
		});
}

function progressBar( nElem ) {
	let bar = `<div class="progress-bar" style="display:inline-block;">`;
	for ( let i = 0 ; i < nElem ; i++ ) {
		bar += `<div class="progress-bar-elem" style="display:inline-block;height:100%;width:${100 / nElem}%"></div>`;
	}
	bar += '</div>';
	return bar;
}

function startProgressBar( num, interval ) {
	return setInterval( () => {
		let visible = $('.progress-bar-elem-visible');
		let nVisible = ( visible ) ? $(visible).length : 0;
		let lastVisible = ( visible ) ? $(visible).last() : null;
		let makeVisible = null;
		let makeInvisible = null;
		if ( ! $(lastVisible).length ) {
			makeVisible = $('.progress-bar-elem').eq(0);
		} else if ( ! $(lastVisible).next('.progress-bar-elem').length ) {
			if ( $('.progress-bar-elem').eq(0).hasClass('progress-bar-elem-visible') ) {
				makeVisible = $('.progress-bar-elem').not('.progress-bar-elem-visible').first();
				makeInvisible = $('.progress-bar-elem').not('.progress-bar-elem-visible').last().next();
			} else {
				makeVisible = $('.progress-bar-elem').eq(0);
				makeInvisible = $(visible).first();
			}
		} else {
			makeVisible = $(lastVisible).next();
			if ( nVisible >= num ) {
				makeInvisible = $(visible).first();
			}
		}
		if ( $(makeVisible).length ) {
			$(makeVisible).addClass('progress-bar-elem-visible');
		}
		if ( $(makeInvisible).length ) {
			$(makeInvisible).removeClass('progress-bar-elem-visible');
		}
	}, interval );
}

function inputHandler() {
	$('#form-state').on('submit', function( event ) {
		event.preventDefault();
		console.log( $('#input-state').val() );
		$('#input-state-submit').prop('disabled', true);
		$('#input-state').prop('disabled', true);
		getParksInState( $('#input-state').val() );
	})
}

$(document).ready( () => {
	console.log( STATE_NAMES );
	if ( CSS.supports("backdrop-filter: blur(2px)") ) {
		$('footer').addClass('backdrop-blur');
	}
	$(inputHandler);
})