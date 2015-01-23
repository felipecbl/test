<%@ WebHandler Language="C#" Class="ImageCrop" %>

using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Policy;
using System.Web;
using Buyatab.Apps.Common;

public class ImageCrop : IHttpHandler
{
    
    public void ProcessRequest (HttpContext context)
    {
        int bigWidth = 590;
        int bigHeight = 295;
    
        int mediumWidth = 200;
        int mediumHeight = 100;

        int mobileWidth = 200;
        int mobileHeight = 100;
    
        int smallWidth = 56;
        int smallHeight = 28;
        
        // Create a 'status' object for the response
        var cropResponse = new CropResponse();
        
        try
        {
            // These four variables are the only ones that appear to be used in Felipe's original php script
            decimal requestRealWidth, requestRealHeight = 0, requestRealX = 0, requestRealY = 0;

            bool gotParams =
                Decimal.TryParse(context.Request["real_w"], out requestRealWidth) &&
                Decimal.TryParse(context.Request["real_h"], out requestRealHeight) &&
                Decimal.TryParse(context.Request["real_x"], out requestRealX) &&
                Decimal.TryParse(context.Request["real_y"], out requestRealY) &&
                Int32.TryParse(context.Request["big_w"], out bigWidth) &&
                Int32.TryParse(context.Request["big_h"], out bigHeight) &&
                Int32.TryParse(context.Request["medium_w"], out mediumWidth) &&
                Int32.TryParse(context.Request["medium_h"], out mediumHeight) &&
                Int32.TryParse(context.Request["mobile_w"], out mobileWidth) &&
                Int32.TryParse(context.Request["mobile_h"], out mobileHeight) &&
                Int32.TryParse(context.Request["small_w"], out smallWidth) &&
                Int32.TryParse(context.Request["small_h"], out smallHeight);

            bool paramsValid =
                requestRealWidth > 0 &&
                requestRealHeight > 0;
            
            if (gotParams && paramsValid)
            {
                int realWidth = (int)Math.Round(requestRealWidth);
                int realHeight = (int)Math.Round(requestRealHeight);
                int realX = (int) Math.Round(requestRealX);
                int realY = (int)Math.Round(requestRealY);

                
                /* Other variables passed in
                int width = Int32.Parse(context.Request["w"]);
                int height = Int32.Parse(context.Request["h"]);
                int originalWidth = Int32.Parse(context.Request["orignal_w"]);
                int originalHeight = Int32.Parse(context.Request["orignal_h"]);
        
                int x = Int32.Parse(context.Request["x"]);
                int y = Int32.Parse(context.Request["y"]);
                int originalX = Int32.Parse(context.Request["orignal_x"]);
                int originalY = Int32.Parse(context.Request["orignal_y"]);

                int top = Int32.Parse(context.Request["0"]);
                int left = Int32.Parse(context.Request["left"]);
                int xFactor = Int32.Parse(context.Request["x_factor"]);
                */


                // Get the image url and extract the virtual directory 
                string url = new Uri(context.Request["src"]).PathAndQuery;
                string virtualPath = VirtualPathUtility.GetDirectory(url);

                // Map the physical path of the file, and get the filename and extension
                string serverPath = context.Server.MapPath(virtualPath);
                
                string imageFilename = VirtualPathUtility.GetFileName(url);
                string imageExtension = VirtualPathUtility.GetExtension(url);

                // Generate a random id
                string uniqueId = generateId();
                
                // Load the image
                Bitmap originalImage = new Bitmap(serverPath + imageFilename);

                // Crop and save the image
                Bitmap croppedImage = Imager.Crop(originalImage,
                    new Rectangle(new Point(realX, realY), new Size(realWidth, realHeight)));
                //croppedImage.Save(serverPath + "crop" + imageExtension);
                Imager.SaveFileAsJpg(croppedImage, serverPath + uniqueId + imageExtension);
                
                // Resize and save big, medium and small versions of the cropped image
                Bitmap bigImage = Imager.Resize(croppedImage, bigWidth, bigHeight, false);
                //bigImage.Save(serverPath + "big" + imageExtension);
                Imager.SaveFileAsJpg(bigImage, serverPath + "big" + imageExtension);
                
                Bitmap mediumImage = Imager.Resize(croppedImage, mediumWidth, mediumHeight, false);
                //mediumImage.Save(serverPath + "medium" + imageExtension);
                Imager.SaveFileAsJpg(mediumImage, serverPath + "medium" + imageExtension);
                
                Bitmap mobileImage = Imager.Resize(croppedImage, mobileWidth, mobileHeight, false);
                //mobileImage.Save(serverPath + "mobile" + imageExtension);
                Imager.SaveFileAsJpg(mobileImage, serverPath + "mobile" + imageExtension);
                
                Bitmap smallImage = Imager.Resize(croppedImage, smallWidth, smallHeight, false);
                //smallImage.Save(serverPath + "small" + imageExtension);
                Imager.SaveFileAsJpg(smallImage, serverPath + "small" + imageExtension);
                
                // Set parameters on the CropResponse
                cropResponse.success = true;
                cropResponse.progress = 100;
            }

            // Set parameters on the CropResponse
            cropResponse.success = (gotParams && paramsValid);
            cropResponse.progress = cropResponse.success ? 100 : 0;
        }
        catch (Exception ex)
        {
            // Set parameters on the CropResponse
            cropResponse.success = false;
            cropResponse.progress = 0;

            context.Response.Write(ex);
        }

        // Return the response
        context.Response.Write(cropResponse);
    }

    public string generateId()
    {
        // Randomly generate a string of alphanumberic characters
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var uniqueId = new string(
            Enumerable.Repeat(chars, 14)
                      .Select(s => s[random.Next(s.Length)])
                      .ToArray());

        return uniqueId;
    }

    private class CropResponse
    {
        public bool success;
        public int progress;

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }

    public static class Imager
    {
        public static int SaveFileAsJpg(Bitmap bmp1, string saveToPath)
        {

            ImageCodecInfo jgpEncoder = GetEncoder(ImageFormat.Jpeg);

            // Create an Encoder object based on the GUID
            // for the Quality parameter category.
            System.Drawing.Imaging.Encoder myEncoder =
                System.Drawing.Imaging.Encoder.Quality;

            // Create an EncoderParameters object.
            // An EncoderParameters object has an array of EncoderParameter
            // objects. In this case, there is only one
            // EncoderParameter object in the array.
            EncoderParameters myEncoderParameters = new EncoderParameters(1);

            EncoderParameter myEncoderParameter = new EncoderParameter(myEncoder, 100L);
            myEncoderParameters.Param[0] = myEncoderParameter;
            try
            {
                bmp1.Save(saveToPath, jgpEncoder,
                    myEncoderParameters);

                return 0;
            }
            catch (Exception ex)
            {
                return -1;
            }
        }
        
        public static void SaveJpeg(string path, Bitmap img)
        {
            var qualityParam = new EncoderParameter(Encoder.Quality, 100L);
            var jpegCodec = GetEncoder(ImageFormat.Jpeg);// GetEncoderInfo("image/jpeg");
            
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = qualityParam;
            img.Save(path, jpegCodec, encoderParams);
        }

        public static void Save(string path, Bitmap img, ImageCodecInfo imageCodecInfo)
        {
            var qualityParam = new EncoderParameter(Encoder.Quality, 100L);

            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = qualityParam;
            img.Save(path, imageCodecInfo, encoderParams);
        }

        public static ImageCodecInfo GetEncoderInfo(string mimeType)
        {
            return ImageCodecInfo.GetImageEncoders().FirstOrDefault(t => t.MimeType == mimeType);
        }

        public static ImageCodecInfo GetEncoder(ImageFormat format)
        {

            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();

            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }

        public static Bitmap Resize(Bitmap image, int newWidth, int maxHeight, bool onlyResizeIfWider)
        {
            if (onlyResizeIfWider && image.Width <= newWidth) newWidth = image.Width;

            var newHeight = image.Height * newWidth / image.Width;
            if (newHeight > maxHeight)
            {
                // Resize with height instead
                newWidth = image.Width * maxHeight / image.Height;
                newHeight = maxHeight;
            }

            Bitmap thumbnail = new Bitmap(newWidth, newHeight);

            using (var graphic = Graphics.FromImage(thumbnail))
            {
                graphic.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphic.SmoothingMode = SmoothingMode.HighQuality;
                graphic.PixelOffsetMode = PixelOffsetMode.HighQuality;
                graphic.CompositingQuality = CompositingQuality.HighQuality;
                graphic.DrawImage(image, 0, 0, newWidth, newHeight);
            }
            return thumbnail;
        }

        public static Bitmap Crop(Bitmap image, Rectangle cropArea)
        {
            // Anonymous method to adjust the crop size if it extends past the edge of the image
            Func<int, int, int, int> adjustToFit = (p, cropSize, imageSize) => 
                    (p + cropSize > imageSize) 
                    ? imageSize - p 
                    : cropSize;

            cropArea.Width = adjustToFit(cropArea.X, cropArea.Width, image.Width);
            cropArea.Height = adjustToFit(cropArea.Y, cropArea.Height, image.Height);
            
            var bmpImage = image;
            var bmpCrop = bmpImage.Clone(cropArea, bmpImage.PixelFormat);
            return bmpCrop;
        }
    }

}