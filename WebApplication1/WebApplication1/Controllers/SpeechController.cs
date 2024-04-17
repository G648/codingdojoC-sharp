using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Net;
using System.Reflection.PortableExecutable;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpeechController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string subscriptionKey = "";
        private readonly string subscriptionRegion = "brazilsouth";

        public SpeechController(IWebHostEnvironment environment)
        {
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        }

        [HttpGet("TextToSpeech")]
        public async Task<IActionResult> Teste(string text)
        {


            var config = SpeechConfig.FromSubscription(subscriptionKey, subscriptionRegion);
            config.SpeechSynthesisVoiceName = "pt-BR-FabioNeural";


            using var synthesizer = new SpeechSynthesizer(config);

            using var result = await synthesizer.SpeakTextAsync(text);

            if (result.Reason == ResultReason.SynthesizingAudioCompleted)
            {
                Console.WriteLine($"Speech synthesized for text [{text}]");
            }
            else if (result.Reason == ResultReason.Canceled)
            {
                var cancellation = SpeechSynthesisCancellationDetails.FromResult(result);

                if (cancellation.Reason == CancellationReason.Error)
                {
                    return BadRequest($"CANCELED: ErrorCode={cancellation.ErrorCode} CANCELED: ErrorDetails=[{cancellation.ErrorDetails}] CANCELED: Did you update the subscription info?");
                }
                return BadRequest($"CANCELED: Reason={cancellation.Reason}");
            }

            MemoryStream ms = new MemoryStream(result.AudioData);

            var filename = DateTime.Now.ToString().Replace("/","").Replace(":", "").Replace(" ", "-").Trim() + ".mp3";

            System.IO.File.WriteAllBytes($"{_environment.ContentRootPath}/wwwroot/{filename}", result.AudioData);

            var file = File(ms, "audio/wav", "teste.wav");

            

            return Ok(filename);
        }



        [HttpPost("SpeechToText")]
        public async Task<IActionResult> Teste(IFormFile audio)
        {
            var config = SpeechConfig.FromSubscription(subscriptionKey, subscriptionRegion);

            var stream = audio.OpenReadStream();

            var reader = new BinaryReader(stream);

            using var audioConfigStream = AudioInputStream.CreatePushStream();
            using var audioConfig = AudioConfig.FromStreamInput(audioConfigStream);
            using var speechRecognizer = new SpeechRecognizer(config, "pt-BR", audioConfig);


            byte[] readBytes;
            do
            {
                readBytes = reader.ReadBytes(1024);
                audioConfigStream.Write(readBytes, readBytes.Length);

            } while (readBytes.Length > 0);

            var result = await speechRecognizer.RecognizeOnceAsync();

            return Ok(result.Text);

        }

    }
}
