
const DATA_URL_PATTERN = new RegExp("^data:");
const ABSOLUTE_URL_PATTERN = new RegExp("^https?://");


/**
 * @summary Utility Class for DOM
 * @memberof mapray
 */
class Dom {

    /**
     * @param  {number}  width
     * @param  {number}  height
     * @return {CanvasRenderingContext2D}
     */
    static createCanvasContext( width, height )
    {
        var canvas = document.createElement( "canvas" );
        canvas.width  = width;
        canvas.height = height;
        return canvas.getContext( "2d" );
    }

    /**
     * 画像を読み込みます。
     * @param  {string|Blob}  src
     * @param  {string}  options.crossOrigin
     */
    static loadImage( src, options={} )
    {
        return new Promise( (resolve, reject) => {
                const image = new Image();
                image.onload  = event => resolve( event.target );
                image.onerror = event => reject( new Error("Failed to load image") );
                if ( options.crossOrigin !== undefined ) {
                    image.crossOrigin = options.crossOrigin;
                }
                if ( src instanceof Blob ) {
                    image.src = URL.createObjectURL( src );
                }
                else {
                    image.src = src;
                }
        } );
    }

    /**
     * 画像が読み込まれるまで待ちます。
     * @param  {HTMLImageElement}  image
     */
    static waitForLoad( image )
    {
        if ( !image.src ) return Promise.reject( new Error( "src was not set" ) );
        if ( image.complete ) {
            return Promise.resolve( image );
        }
        return new Promise( (resolve, reject) => {
                const prevOnLoad  = image.onload;
                const prevOnError = image.onerror;
                image.onload = event => {
                    if ( prevOnLoad ) prevOnLoad( event );
                    resolve( event.target );
                };
                image.onerror = event => {
                    if ( prevOnError ) prevOnError( event );
                    reject( new Error("Failed to load image") );
                };
        } );
    }

    static resolveUrl( baseUrl, url ) {
        if ( DATA_URL_PATTERN.test( url ) || ABSOLUTE_URL_PATTERN.test( url ) ) {
            // url がデータ url または絶対 url のときは
            // そのまま url をリクエスト
            return url;
        }
        else {
            // それ以外のときは url を相対 url と解釈し
            // 基底 url と結合した url をリクエスト
            return baseUrl + url;
        }
    }

}


Dom.SYSTEM_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";


export default Dom;
