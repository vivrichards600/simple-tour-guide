// Load the configuration file
fetch('./app.config.json')
    .then(response => response.json())
    .then(config => {
        // Update the page title
        document.title = config.appName;

        // Update the page styles
        const appTheme = document.getElementById('app-theme');
        if (appTheme) {
                appTheme.href = "assets/styles/" + config.theme;
        }

        // Update the app name
        const appNameElement = document.getElementById('app-name');
        if (appNameElement) {
            appNameElement.textContent = config.appName;
        }

        // Update the description
        const descriptionElement = document.getElementById('description');
        if (descriptionElement) {
            descriptionElement.textContent = config.description;
        }

    })
    .catch(error => {
        console.error('Error loading configuration:', error);
    });
