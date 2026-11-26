import Foundation
import ImageIO
let input=URL(fileURLWithPath:"tests/fixtures/orientation.png")
let source=CGImageSourceCreateWithURL(input as CFURL,nil)!
let image=CGImageSourceCreateImageAtIndex(source,0,nil)!
for (name,count,rotation) in [("rotated",1,6),("multi",2,1)] {
 let output=URL(fileURLWithPath:"tests/fixtures/\(name).heic")
 let destination=CGImageDestinationCreateWithURL(output as CFURL,"public.heic" as CFString,count,nil)!
 for index in 0..<count {CGImageDestinationAddImage(destination,index == 0 ? image : CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(URL(fileURLWithPath:"tests/fixtures/second.png") as CFURL,nil)!,0,nil)!,[kCGImagePropertyOrientation:rotation,kCGImageDestinationLossyCompressionQuality:0.95,kCGImagePropertyTIFFDictionary:[kCGImagePropertyTIFFOrientation:rotation],kCGImagePropertyExifDictionary:[kCGImagePropertyExifUserComment:"Synthetic fixture \(index)"]] as CFDictionary)}
 print(name,CGImageDestinationFinalize(destination))
}
