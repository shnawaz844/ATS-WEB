const key = 'AIzaSyAoRPa-NfI_5UNUU97suby3xc86tsgi_XE';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
        if (d.models) {
            console.log("Available Gemini Models:");
            d.models.forEach(m => {
                if (m.name.includes('gemini')) console.log(m.name);
            });
        } else {
            console.log("No models found or error:", d);
        }
    })
    .catch(e => console.error(e));
