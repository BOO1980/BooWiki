import React from 'react';
import {Route, IndexRoute} from 'react-router';

/**
 * import all page components here
 */
import App from '.components/App';

/**
 * All routes go here.
 * Don't forget to import the components above after
 */

export default(
    <Route path="/" component={App}>
        <IndexRoute component={MainPage}/>
    </Route>
)
