pageTypes:[
    {
        name: "Product Page",
        isMatch: function() {
            //using brightLog from the Helpers examples
            evgHelpers.brightLog( `We are looking at a ${[...document.getElementsByTagName("h1")].map(a=>a.innerHTML)[1]}`)
             //Using RegEx to match the URL to identify this is a product page
            return window.location.href.match('.*?phones/[a-z]')!=null
        },
        //Here I use the Spread syntax (...) to expand getElementsByTagName into an array, as that method returns an array-like object
        //not a real array. Then the .map method creates an array the innerHTMLs (i.e. text) of each h1 tag found. We use the second [1] 
        //in the returned array to get our product name.
        // We return one action per page/item because we can use this in IS to 
        action: "View "+[...document.getElementsByTagName("h1")].map(a=>a.innerHTML)[1],
        onActionEvent: function(event) {
            evgHelpers.brightLog('tHiS iS a PrOdUcT!')
            //We can return event attributes here if we want.
            event.attributes ? event.attributes.pageAttr = {abc: 1, def: 2 } : event.attributes = { pageAttr: {abc: 1, def: 2 } };
            return event;
        },
    catalog: {
            Product: {
                _id: [...document.getElementsByTagName("h1")].map(a=>a.innerHTML)[1],
                name: [...document.getElementsByTagName("h1")].map(a=>a.innerHTML)[1],
                url: Evergage.resolvers.fromHref(),
                imageUrl:[...document.getElementsByClassName('swiper-slide swiper-slide-active')].map(a=>{if (a.firstChild.tagName==='IMG') return a.firstChild.src})[1],
                description: `The ${[...document.getElementsByTagName("h1")].map(a=>a.innerHTML)[1]} product`,
                price: [...document.getElementsByClassName('mtc')].map(a=>{if (a.firstChild?.innerText) return a.firstChild.innerText.match('.*?([0-9]+\.[0-9]+)')[1]})[0],
        //       categories:{
        //           _id: "Article",
        //          type: "c"
    //         },
                dimensions:{
                    //Dimensions (Now called catalog related objects) must always be returned as arrays. You can return multiple values if your
                    //object is set up to allow multiple values to be held against the parent.
                    ContentClass: [...document.getElementsByName('ContractLength')].map(a=>{return a.ariaLabel}),
                    Brand:evgHelpers.capThis(document.location.href.split('/')[5]),
                    Category:()=> {if(document.location.href.split('/')[3]==='mobile') return ['Smart Phone']},
                    Style:()=> evgHelpers.capThis(document.location.href.split('/')[4]),
                }
            }
        }
    }
]