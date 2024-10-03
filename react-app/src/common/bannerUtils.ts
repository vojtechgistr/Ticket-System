export const RGBtoHSV = (color: RGBColor): HSVColor => {
    // declare variables for red, green, blue, hue, saturation, value, and difference
    let redAbsolute: number,
        greenAbsolute: number,
        blueAbsolute: number,
        red: number,
        green: number,
        blue: number,
        hue: number = 0,
        saturation: number,
        value: number,
        difference: number;

    // Make r, g, and b fractions of 1
    redAbsolute = color.R / 255;
    greenAbsolute = color.G / 255;
    blueAbsolute = color.B / 255;

    // Find greatest and smallest channel values
    value = Math.max(redAbsolute, greenAbsolute, blueAbsolute)
    difference = value - Math.min(redAbsolute, greenAbsolute, blueAbsolute);

    // Find difference between color channels
    const differenceColor = (color: number) => {
        return (value - color) / 6 / difference + 1 / 2;
    };

    // Round to nearest 100th (percentage)
    const percentageRound = (number: number) => {
        return Math.round(number * 100) / 100;
    };

    // Make grey if there is no color difference
    if (difference === 0) {
        hue = saturation = 0;
    } else {
        // Find saturation and hue
        saturation = difference / value;

        // Find the red/green/blue difference
        red = differenceColor(redAbsolute);
        green = differenceColor(greenAbsolute);
        blue = differenceColor(blueAbsolute);

        // Find the greatest channel and assign hue based on which channel it is
        if (redAbsolute === value) {
            hue = blue - green;
        } else if (greenAbsolute === value) {
            hue = (1 / 3) + red - blue;
        } else if (blueAbsolute === value) {
            hue = (2 / 3) + green - red;
        }

        // Make negative hues positive behind 360°
        if (hue < 0) {
            hue += 1;
        } else if (hue > 1) {
            hue -= 1;
        }
    }

    // return the hue, saturation, and value
    return {
        H: Math.round(hue * 360),
        S: percentageRound(saturation * 100),
        V: percentageRound(value * 100)
    };
}

const HSVtoRGB = (color: HSVColor): RGBColor => {
    // convert saturation and value to fractions
    if (color.S > 1) {
        color.S /= 100;
    }

    if (color.V > 1) {
        color.V /= 100;
    }

    let d = 0.0166666666666666 * color.H;
    let c = color.V * color.S;
    let x = c - c * Math.abs(d % 2.0 - 1.0);
    let m = color.V - c;
    c += m;
    x += m;

    // Declare variables for red, green, blue
    let R = 0,
        G = 0,
        B = 0;

    // Find the red, green, and blue values based on the hue
    switch (d >>> 0) {
        case 0:
            R = c;
            G = x;
            B = m;
            break;
        case 1:
            R = x;
            G = c;
            B = m;
            break;
        case 2:
            R = m;
            G = c;
            B = x;
            break;
        case 3:
            R = m;
            G = x;
            B = c;
            break;
        case 4:
            R = x;
            G = m;
            B = c;
            break;
        default:
            R = c;
            G = m;
            B = x;
    }

    // return the red, green, and blue values
    return {
        R: R,
        G: G,
        B: B
    };
};

export type RGBColor = {
    G: number,
    B: number
    R: number,
}

export type HSVColor = {
    H: number,
    S: number
    V: number,
}

export function getAverageColor(imageElement: HTMLImageElement, ratio = 1): RGBColor {
    const canvas = document.createElement("canvas")
    let height = canvas.height = imageElement.naturalHeight
    let width = canvas.width = imageElement.naturalWidth

    const context = canvas.getContext("2d");
    context!.drawImage(imageElement, 0, 0)

    let data, length;
    let i = -4; // start at -4 so first iteration is 0
    let count = 0; // keep track of number of pixels

    try {
        // get image data
        data = context!.getImageData(0, 0, width, height)
        // get length of data
        length = data.data.length

    } catch (err) {
        // if error, return black color
        return {
            R: 0,
            G: 0,
            B: 0
        }
    }

    // set initial values for red, green, blue
    let R, G, B
    R = G = B = 0

    // loop through each pixel based on ratio
    //  is used to reduce the number of pixels used to calculate average color
    // this is done to improve performance
    // ratio is set to 1 by default
    while ((i += ratio * 4) < length) {
        // increment count
        count++;

        // add red, green, blue values
        R += data.data[i]
        G += data.data[i + 1]
        B += data.data[i + 2]
    }

    // divide by count to get average
    R = ~~(R / count)
    G = ~~(G / count)
    B = ~~(B / count)

    return {
        R,
        G,
        B
    }
}

export const makeColorLighter = (color: RGBColor): RGBColor => {
    let colorHSV = RGBtoHSV(color);

    // edit saturation
    if (colorHSV.S < 50) {
        colorHSV.S += 20;
    } else if (colorHSV.S < 60) {
        colorHSV.S += 10;
    }

    // edit value
    if (colorHSV.V < 60) {
        colorHSV.V += 20;
    } else if (colorHSV.V < 70) {
        colorHSV.V += 10;
    }

    let colorRGB: RGBColor = HSVtoRGB(colorHSV);
    return {
        R: Math.round(255 * colorRGB.R),
        G: Math.round(255 * colorRGB.G),
        B: Math.round(255 * colorRGB.B)
    };
};

export const makeColorDarker = (color: RGBColor): RGBColor => {
    let colorHSV = RGBtoHSV(color);

    // edit hue
    if (colorHSV.H > 20) {
        colorHSV.H += 10;
    } else if (colorHSV.H > 10) {
        colorHSV.H += 20;
    }

    // edit saturation
    if (colorHSV.S > 90) {
        colorHSV.S -= 15;
    } else if (colorHSV.S > 80) {
        colorHSV.S -= 10;
    }

    // edit value
    if (colorHSV.V > 60) {
        colorHSV.V -= 25;
    } else if (colorHSV.V > 50) {
        colorHSV.V -= 10;
    }

    let colorRGB = HSVtoRGB(colorHSV);
    return {
        R: Math.round(255 * colorRGB.R),
        G: Math.round(255 * colorRGB.G),
        B: Math.round(255 * colorRGB.B)
    };
};

export const averageColorToGradient = (averageColor: RGBColor) => {
    const lighterColor = makeColorLighter(averageColor);
    const darkerColor = makeColorDarker(lighterColor);

    // convert colors to rgb string for gradient
    const rgb = `${lighterColor.R}, ${lighterColor.G}, ${lighterColor.B}`;
    const rgb2 = `${darkerColor.R}, ${darkerColor.G}, ${darkerColor.B}`;

    // construct gradient
    return `linear-gradient(to bottom, rgba(${rgb}, 1), rgba(${rgb2}, 0.6))`;
};