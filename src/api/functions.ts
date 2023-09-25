import { ModelOptions } from "@type/chat";
import { encoder } from "@utils/messageUtils";
import { createCalculator } from "@openai_function_calling_tools/calculator";
import { createClock } from "@openai_function_calling_tools/clock";
import { createRequest } from "@openai_function_calling_tools/request";
import { htmlToText } from 'html-to-text';
import { createGoogleCustomSearch } from "@src/openai_function_calling_tools/googleCustomSearch";
import { createSIEMUseCaseMetadata } from "@openai_function_calling_tools/siemUseCase";
import { createImageCreator } from "@openai_function_calling_tools/createImage";

const [calculator, calculatorSchema] = createCalculator();
const [clock, clockSchema] = createClock();
const [request, requestSchema] = createRequest();
const [googleCustomSearch, googleCustomSearchSchema] = createGoogleCustomSearch();
const [siemUCMetadata, siemUCMetadataSchema] = createSIEMUseCaseMetadata();
const [createImage, createImageMetadataSchema] = createImageCreator();

// const [webBrowser, webBrowserSchema] = createWebBrowser();

const options = {
    wordwrap: 130,
    baseElements: {
        selectors: ['body']
    }
};

const mapHasIgnoreCase = (map: Map<string, Function>, key: string) => {
    for (const [k, v] of map.entries()) {
        if (k.toLowerCase() === key.toLowerCase()) {
            return true;
        }
    }

    return false;
}

const mapGetIgnoreCase = (map: Map<string, Function>, key: string) => {
    for (const [k, v] of map.entries()) {
        if (k.toLowerCase() === key.toLowerCase()) {
            return v;
        }
    }

    return undefined;
}

export const executeFunction = async (apiKey: string, name: string, params?: any) => {
    name = name.toLowerCase();
    let paramsOk = false;

    try {
        if (params) params = JSON.parse(params);
        paramsOk = true;
    } catch (error) {
    }

    let functionMaps: Map<string, Function> = new Map([
        ["calculator", async () => { return calculator(params) }],
        ["clock", async () => { return clock(params) }],
        ["request", async () => { return htmlToText(await request(params), options) }],
        ["googleCustomSearch", async () => { return await googleCustomSearch(params) }],
        ["SIEMUseCaseMetadata", async () => { return await siemUCMetadata(params) }],
        ["createImage", async () => { params.apiKey = apiKey; return await createImage(params) }],
    ]);

    if (paramsOk && mapHasIgnoreCase(functionMaps, name)) {
        let fun = mapGetIgnoreCase(functionMaps, name);
        if (fun === undefined) return "This function does not exist!";
        return await fun();
    } else if (!mapHasIgnoreCase(functionMaps, name)) {
        return "This function does not exist!";
    } else if (!paramsOk) {
        return "Invalid params! Probably not in a json format!";
    }

    return "Something went wrong!";
}

export const functionsSchemas = [
    calculatorSchema,
    clockSchema,
    requestSchema,
    googleCustomSearchSchema,
    siemUCMetadataSchema,
    createImageMetadataSchema,

    // webBrowserSchema,
]

export const functionsSchemaTokens = (model: ModelOptions) => encoder.encode(JSON.stringify(functionsSchemas), 'all').length - (functionsSchemas.length * 35) - 3;
