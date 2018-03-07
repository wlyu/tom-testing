package main

import "fmt"

func main() {
}

type Player interface {
	Play(source string)
}
type MP3Player struct{}

func (mp3Player *MP3Player) Play(source string) {
	fmt.Println(mp3Player)
}

type WAVPlayer struct{}

func (wavPlayer *WAVPlayer) Play(source string) {
	fmt.Println(wavPlayer)
}
func Play(source string, mtype string) {
	var p Player
	switch mtype {
	case "MP3":
		p = &MP3Player{}
	case "WAV":
		p = &WAVPlayer{}
	default:
		fmt.Println("Unsupported music type", mtype)
		return
	}
	p.Play(source)
}
