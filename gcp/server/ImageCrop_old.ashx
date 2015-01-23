<%@ WebHandler Language="C#" Class="ImageCrop_old" %>

using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Policy;
using System.Web;

public class ImageCrop_old : IHttpHandler
{
    private const int bigWidth = 590;
    private const int bigHeight = 295;
    
    private const int mediumWidth = 200;
    private const int mediumHeight = 100;
    
    private const int smallWidth = 56;
    private const int smallHeight = 28;
    
    public void ProcessRequest (HttpContext context)
    {
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
                Decimal.TryParse(context.Request["real_y"], out requestRealY);

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
                string url = context.Request["src"];
                string virtualPath = VirtualPathUtility.GetDirectory(url);

                // Map the physical path of the file, and get the filename and extension
                string serverPath = context.Server.MapPath(virtualPath);
                string imageFilename = VirtualPathUtility.GetFileName(url);
                string imageExtension = VirtualPathUtility.GetExtension(url);


                // Load the image
                var originalImage = Image.FromFile(serverPath + imageFilename);


                // Crop and save the image
                var croppedImage = Imager.Crop(originalImage,
                    new Rectangle(new Point(realX, realY), new Size(realWidth, realHeight)));
                croppedImage.Save(serverPath + "crop_" + imageFilename);

                // Resize and save big, medium and small versions of the cropped image
                var bigImage = Imager.Resize(croppedImage, bigWidth, bigHeight, false);
                bigImage.Save(serverPath + "big" + imageExtension);

                var mediumImage = Imager.Resize(croppedImage, mediumWidth, mediumHeight, false);
                mediumImage.Save(serverPath + "medium" + imageExtension);

                var smallImage = Imager.Resize(croppedImage, smallWidth, smallHeight, false);
                smallImage.Save(serverPath + "small" + imageExtension);


                // Set parameters on the CropResponse
                cropResponse.success = true;
                cropResponse.progress = 100;
            }

            // Set parameters on the CropResponse
            cropResponse.success = (gotParams && paramsValid);
            cropResponse.progress = cropResponse.success ? 100 : 0;
        }
        catch (Exception)
        {
            // Set parameters on the CropResponse
            cropResponse.success = false;
            cropResponse.progress = 0;
        }

        // Return the response
        context.Response.Write(cropResponse);
    }

    private class CropResponse
    {
        public bool success;
        public int progress;

        public override string ToString()
        {
            return Buyatab.Apps.Common.JsonSerializer.Serialize(this);
        }
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }

    public static class Imager
    {
        public static void SaveJpeg(string path, Image img)
        {
            var qualityParam = new EncoderParameter(Encoder.Quality, 100L);
            var jpegCodec = GetEncoderInfo("image/jpeg");
            
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = qualityParam;
            img.Save(path, jpegCodec, encoderParams);
        }

        public static void Save(string path, Image img, ImageCodecInfo imageCodecInfo)
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

        public static Image Resize(Image image, int newWidth, int maxHeight, bool onlyResizeIfWider)
        {
            if (onlyResizeIfWider && image.Width <= newWidth) newWidth = image.Width;

            var newHeight = image.Height * newWidth / image.Width;
            if (newHeight > maxHeight)
            {
                // Resize with height instead
                newWidth = image.Width * maxHeight / image.Height;
                newHeight = maxHeight;
            }

            var thumbnail = new Bitmap(newWidth, newHeight);

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

        public static Image Crop(Image image, Rectangle cropArea)
        {
            // Anonymous method to adjust the crop size if it extends past the edge of the image
            Func<int, int, int, int> adjustToFit = (p, cropSize, imageSize) => 
                    (p + cropSize > imageSize) 
                    ? imageSize - p 
                    : cropSize;

            cropArea.Width = adjustToFit(cropArea.X, cropArea.Width, image.Width);
            cropArea.Height = adjustToFit(cropArea.Y, cropArea.Height, image.Height);
            
            var bmpImage = new Bitmap(image);
            var bmpCrop = bmpImage.Clone(cropArea, bmpImage.PixelFormat);
            return bmpCrop;
        }
    }

}