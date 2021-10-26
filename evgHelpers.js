var evgHelpers = {
    //Brightlog - console.log messages appear in a highlighed colour in the browser.
    //Useful for debugging. 
    //Usage: evgHelpers.brightLog(<message>,<(OPTIONAL)hex colour code>)
        brightLog: function(m, c='#0095da') {
        console.log(`%cEvergage::-> ${m}`, `color: white;background-color:${c};font-size:10px`)
    },
    //cleanString returns a string stripped of certain non [a-zA-Z] characters in languages such as
    //Turkish are not supported by IS at this time. 
    //Usage: evgHelpers.cleanString(<string>)
        cleanString: function(i) {
        return i().replace(/[^\x20-\x7E]/g, '')
    },
    //capThis returns a string with the first letter capitalised. Useful for catalog items.
    capThis: function(w) {
        if (w) return [w.charAt(0).toUpperCase() + w.slice(1)]
    },
    //findBiggestImage returns the src of the biggest image found on the page. Useful for catalog building.
    //There is a filer on this example of images that have an src containing 'hover'. This is to 
    //differentiate  product images from others on the page. You will need to adjust this to reflect
    // your brand.
    //Usage: evgHelpers.findBiggestImage()
    findBiggestImage: function () {
        let imgElements = document.getElementsByTagName('img');
        let maxDimension = 0;
        let maxImage = null;
        for (var index in imgElements) {
            var img = imgElements[index];
            var currDimension = img.width * img.height;
            if (currDimension  > maxDimension && !img.src.includes("hover")){
                maxDimension = currDimension
                maxImage = img;
                }
        }
        if (maxImage) return (maxImage.src);
    },
    //getDatalayer waits for the datalayer to become accessible to the browser, then it returns
    //a resolved promise that contains the Krux DL object. It tries 10 times then gives up if not found
    //See DATALAYER code block below for a full example of using this.
    getDataLayer: async function() {    
        return await new Promise((resolve, reject) => {
            let c=0
            let int = setInterval(_=>{
                if (window.DataLayerKrx){
                clearInterval(int)
                let i = window.DataLayerKrx
                    return resolve(i)
                }
                else{
                    c < 10 && c++
                    if(c >= 10) {
                        clearInterval(int)
                        return reject('This page appears to have no Krux datalayer')
                    }
                }
            },300)
        });
        },
    //readFromDataLayer takes the DataLayer, as returned from the function above, and the value to capture
    //and returns the value you want in a form that IS can consume. This can be used for a user profile
    //or dyamic catalogue building.
    //See DATALAYER code block below for a full example of using these together.
    readFromDataLayer: function (DL, value){
        switch(typeof DL[value]) {
            case 'string':
                return unescape(encodeURI(DL[value]))
            break;
            case 'object':
                return DL[value].map(v => unescape(encodeURI(v.name)));
                break;
        }
        console.log(`Found something we didn't account for: ${typeof DL[value]} is a ${value}`)
    }
}

//DATALAYER EXAMPLE
//THE BELOW IS AN EXAMPLE OF USING MULTIPLE HELPERS FROM ABOVE TO POPULATE THE CATALOG. 
//THIS CODE NEEDS TO BE FIRED AFTER EVERGAGE.INIT HAS RESOLVED. (I.E. INERT IT IN THE .then(()=>{})

const waitForDataLayer = (evgHelpers.getDataLayer()
    .then(function(DL) { 
        evgHelpers.brightLog(`Returned datalayer:`, 'green')
        console.log(DL)
        const theCategory =  [evgHelpers.readFromDataLayer(DL,'primaryCategory')]
        const theGeo =  evgHelpers.readFromDataLayer(DL,'geoRegion') 
        const theLanguage =  evgHelpers.readFromDataLayer(DL,'language')
        const theSubCategory =  evgHelpers.readFromDataLayer(DL,'subCategory1')
        const theTitle =  evgHelpers.readFromDataLayer(DL,'pageTitle')
        const theTheme =  evgHelpers.readFromDataLayer(DL,'thematic')
        //Next is an example of why we use a Helper as Tags is an array of objects in the datalayer and needs converting for IS.
        const theTags =  evgHelpers.readFromDataLayer(DL,'tags') 
        // In this next section you just send an event into IS that contains the data you want - in this case it 
        //creates an article and sets a 'viewed' action against the visitor.
        
        //User attributes
        const theAdblocker =  evgHelpers.readFromDataLayer(DL,'adblocker')
        const theUserType =  evgHelpers.readFromDataLayer(DL,'userType') 
        const theProfileID =  evgHelpers.readFromDataLayer(DL,'profileID') 
        const theRaisedPaywall =  evgHelpers.readFromDataLayer(DL,'raisedPaywall') 

                                Evergage.sendEvent({
                            action: 'Viewed an Article',
                            itemAction: Evergage.ItemAction.ViewItem,
                            catalog: {
                                Article: {
                                    _id: theTitle.substring(0, 20).replace(/[^\x20-\x7E]/g, ''),
                                    name: theTitle,
                                    url: window.location.href,
                                    imageUrl: evgHelpers.findBiggestImage(),
                                    dimensions:{
                                        ItemClass: theCategory,
                                        Tags: theTags
                                    }
                                }
                            }
                        });
                               Evergage.sendEvent({
                            action: 'User Visit',
                                user: {
                                    id: theProfileID,
                                    attributes:{
                                       adblocker: theAdblocker,
                                            userType: theUserType,
                                            raisedpaywall:theRaisedPaywall
                                    }
                                }
                        });    
    })
    .catch(e =>{
        console.error(`Could not get datalayer: ${e}`)
    })
);