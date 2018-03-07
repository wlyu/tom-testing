package main

import "errors"

type MusicManager struct {
	musics [] MusicEntry
}
type MusicEntry struct {
	Id     string
	Name   string
	Artist string
	Source string
	Tpye   string
}

func NewMusicManager() *MusicManager {
	return &MusicManager{make([]MusicEntry, 0)}
}

func (m *MusicManager) len() int {
	return len(m.musics)
}
func (m *MusicManager) Get(index int) (music *MusicEntry, err error) {
	if index < 0 || index >= len(m.musics) {
		return nil, errors.New("Index out of range.")
	}
	return &m.musics[index], nil
}

func (m *MusicManager) Find(name string) *MusicEntry {

	if len(m.musics) == 0 {
		return nil
	}
	for _, mm := range m.musics {
		if mm.Name == name {
			return &mm
		}
	}
	return nil
}

func (m *MusicManager) Add(music *MusicEntry) {
	m.musics = append(m.musics, *music)
}
func (m *MusicManager) remove(index int) *MusicEntry {
	if index < 0 || index >= len(m.musics) {
		return nil
	}
	removeMusic := &m.musics[index]
	if index < len(m.musics)-1 {
		m.musics = append(m.musics[:index], m.musics[index+1:]...)
	} else if index == 0 {
		m.musics = make([]MusicEntry, 0)
	} else {
		m.musics = m.musics[:index-1]
	}
	return removeMusic
}
