export function playTransitionSound() {
    const audio = new Audio("/audio/transition.wav");
    audio.volume = 0.4;
    audio.play().catch((error) => {
      console.log("An error has occurred:", error);
    })
}
