<%@ WebHandler Language="C#" Class="GhostProxy" %>

using System;
using System.IO;
using System.Web;
using System.Net;

public class GhostProxy : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        try
        {
            string filepath = getFilePath(context.Request.QueryString["action"]);

            HttpRequest original = context.Request;
            HttpWebRequest newRequest = (HttpWebRequest)WebRequest.Create(
                filepath + "?" + context.Request.QueryString.ToString());

            newRequest.ContentType = original.ContentType;
            newRequest.Method = original.HttpMethod;
            newRequest.UserAgent = original.UserAgent;

            Stream reqStream = newRequest.GetRequestStream();

            byte[] originalStream;
            using (var memoryStream = new MemoryStream())
            {
                original.InputStream.CopyTo(memoryStream);
                originalStream = memoryStream.ToArray();
            }

            reqStream.Write(originalStream, 0, originalStream.Length);
            reqStream.Close();

            WebResponse response = newRequest.GetResponse();

            byte[] responseStream;
            using (var memoryStream = new MemoryStream())
            {
                response.GetResponseStream().CopyTo(memoryStream);
                responseStream = memoryStream.ToArray();
            }

            context.Response.BinaryWrite(responseStream);
        }
        catch
        {
            context.Response.Write("Failed");
        }
        
    }
    
    private string getFilePath(string action)
    {
        string filepath = null;

        switch (action)
        {
            case "u":

                filepath = "http://66.40.38.185/gcp/server/ImageUpload.ashx";

                break;

            case "c":

                filepath = "http://66.40.38.185/gcp/server/ImageCrop.ashx";

                break;
                
            case "cs":

                filepath = "http://66.40.38.185/gcp/server/CardStyleUpload.ashx";

                break;
        }

        return filepath;
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }

}