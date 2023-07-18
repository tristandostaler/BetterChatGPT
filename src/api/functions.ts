import { ModelOptions } from "@type/chat";
import { encoder } from "@utils/messageUtils";
import { createCalculator } from "@openai_function_calling_tools/calculator";
import { createClock } from "@openai_function_calling_tools/clock";
import { createRequest } from "@openai_function_calling_tools/request";
import { htmlToText } from 'html-to-text';
import { createGoogleCustomSearch } from "@src/openai_function_calling_tools/googleCustomSearch";
import { createSIEMUseCaseMetadata } from "@openai_function_calling_tools/siemUseCase";

const [calculator, calculatorSchema] = createCalculator();
const [clock, clockSchema] = createClock();
const [request, requestSchema] = createRequest();
const [googleCustomSearch, googleCustomSearchSchema] = createGoogleCustomSearch();
const [siemUCMetadata, siemUCMetadataSchema] = createSIEMUseCaseMetadata();
// const [webBrowser, webBrowserSchema] = createWebBrowser();

const options = {
    wordwrap: 130,
    baseElements: {
        selectors: ['body']
    }
};

export const executeFunction = async (name: string, params?: any) => {
    name = name.toLowerCase();
    if (name == "calculator".toLowerCase()) return calculator(params)
    if (name == "clock".toLowerCase()) return clock(params)
    if (name == "request".toLowerCase()) return htmlToText(await request(params), options)
    if (name == "googleCustomSearch".toLowerCase()) return await googleCustomSearch(params)
    if (name == "SIEMUseCaseMetadata".toLowerCase()) return await siemUCMetadata(params)
    // if (name == "webbrowser") return await webBrowser(params)
    return null
}

export const functionsSchemas = [
    calculatorSchema,
    clockSchema,
    requestSchema,
    googleCustomSearchSchema,
    siemUCMetadataSchema,
    // webBrowserSchema,
]

export const functionsSchemaTokens = (model: ModelOptions) => encoder.encode(JSON.stringify(functionsSchemas), 'all').length;
