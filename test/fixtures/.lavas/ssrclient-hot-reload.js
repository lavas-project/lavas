import 'eventsource-polyfill';
import hotClient from 'webpack-hot-middleware/client?name=ssrclient&noInfo=true&reload=true';


    hotClient.subscribe(payload => {
        if (payload.action === 'reload' || payload.reload === true) {
            window.location.reload();
        }
    });

