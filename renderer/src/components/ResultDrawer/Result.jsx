export default function ResultRenderer(originalAudio, convertedAudio) {
  return (
    <div className={`flex justify-between`}>
      <figure>
        <figcaption className="text-center text-white text-lg">
          Original Identity
        </figcaption>
        <audio className="mt-2" src={originalAudio} controls />
      </figure>
      <figure>
        <figcaption className="text-center text-white text-lg">
          Target Identity
        </figcaption>
        <audio className="mt-2" src={convertedAudio} controls />
      </figure>
    </div>
  );
}
