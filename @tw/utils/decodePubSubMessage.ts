export function decodePubSubMessage(body: any): { data: any; attributes?: any } {
  // push
  if (body.message?.data) {
    let data = Buffer.from(body.message.data, 'base64').toString('utf-8');
    try {
      data = JSON.parse(data);
    } catch (e) {}
    return {
      data,
      attributes: body.message.attributes,
    };
  }
  // pull, if someone pushed a falsey value as push, default to obj
  return {
    data: JSON.parse(Buffer.from(body.data, 'base64').toString('utf-8')) || {},
    attributes: body.attributes || {},
  };
}
