export function curlToPython(curl: string): string {
    let method: string = 'GET';
    const methodMatch = curl.match(/-X\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/i);
    if (methodMatch) {
        method = methodMatch[1].toUpperCase();
    } else if (curl.match(/(-d|--data|--data-raw|--data-ascii|--data-binary)\s/)) {
        method = 'POST';
    }

    // 2. Extract URL (handling various quote cases)
    const urlMatch = curl.match(/['"](https?:\/\/[^'"]+)['"]/);
    const url: string = urlMatch ? urlMatch[1] : '';

    // 3. Extract headers (including -H and -b)
    const headers: Record<string, string> = {};
    // Process -H parameters
    const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
    let headerMatch: RegExpExecArray | null;
    while ((headerMatch = headerRegex.exec(curl)) !== null) {
        headers[headerMatch[1].trim()] = headerMatch[2].trim();
    }
    // Process -b (Cookie)
    const cookieMatch = curl.match(/-b\s+['"]([^'"]+)['"]/);
    if (cookieMatch) {
        headers['Cookie'] = cookieMatch[1];
    }

    // 4. Smart parsing of request body data (handling various data formats)
    let data: any = null;
    let isJson: boolean = false;

    // First check Content-Type
    const contentType = headers['Content-Type'] || headers['content-type'];
    isJson = contentType?.includes('application/json') ?? false;

    // Try to extract data (supports multiple parameter formats)
    const dataParamMatch = curl.match(/(-d|--data|--data-raw|--data-ascii|--data-binary)(?:\s+|=)(['"])(.*?)(?<!\\)\2/s);
    if (dataParamMatch) {
        const rawData = dataParamMatch[3];

        // If it's JSON Content-Type or data looks like JSON
        if (isJson || (rawData.startsWith('{') && rawData.endsWith('}')) ||
            (rawData.startsWith('[') && rawData.endsWith(']'))) {
            try {
                data = JSON.parse(rawData);
                isJson = true;
                // Ensure correct Content-Type
                headers['Content-Type'] = 'application/json';
            } catch (e) {
                data = rawData;
                isJson = false;
            }
        } else {
            data = rawData;
        }
    }
    // 5. Build Python code
    let code: string = 'import requests\n\n';
    code += `url = '${url}'\n`;

    if (Object.keys(headers).length > 0) {
        code += `headers = ${JSON.stringify(headers, null, 4)}\n`;
    }

    if (data !== null) {
        if (isJson) {
            code += `json_data = ${JSON.stringify(data, null, 4)}\n`;
        } else {
            // Handle special characters in strings
            const escapedData = data.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            code += `data = '${escapedData}'\n`;
        }
    }

    code += `\nresponse = requests.${method.toLowerCase()}(\n    url,\n`;

    if (Object.keys(headers).length > 0) {
        code += '    headers=headers,\n';
    }

    if (data !== null) {
        if (isJson) {
            code += '    json=json_data,\n';
        } else {
            code += '    data=data,\n';
        }
    }

    // Handle --insecure (skip SSL verification)
    if (curl.includes('--insecure') || curl.includes('-k')) {
        code += '    verify=False,\n';
    }

    // Remove trailing comma and newline
    code = code.replace(/,\n$/, '\n');
    code += ')\n\n';

    code += 'print(response.status_code)\n';
    code += 'print(response.text)\n';

    return code;
}