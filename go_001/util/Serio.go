package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"os"
	"reflect"
)

type User struct {
	ACTION int32
	SID    int32
}

func ExampleWrite() []byte {
	buf := new(bytes.Buffer)

	var info User
	info.ACTION = 20004
	info.SID = 6

	err := binary.Write(buf, binary.LittleEndian, info)
	if err != nil {
		fmt.Println("binary.Write failed:", err)
	}
	fmt.Printf("% x\n", buf.Bytes())
	return buf.Bytes()
}

func ExampleRead(b []byte) {
	var info User
	buf := bytes.NewBuffer(b)

	err := binary.Read(buf, binary.LittleEndian, &info)
	if err != nil {
		fmt.Println("binary.Read failed:", err)
	}
	fmt.Print(info)
	// Output: 3.141592653589793
}

func main() {
	//buf := ExampleWrite()
	//ExampleRead(buf)
	reflect_test()
}
func test() {
	defer fmt.Println("defer1.....")

	if 2 > 1 {
		fmt.Println("2 > 1 ")
		//os.Exit(-1) 中断
		a := 0
		a = a / a //compiler error,not doing
		return
	}
	defer fmt.Println("defer2.....")

	os.Exit(-1) //imported and not used: "os"
}

type Point struct {
	Age  int
	Name string
}

func reflect_test() {
	po := Point{3, "ddd"}
	s := reflect.ValueOf(&po).Elem()

	for i := 0; i < s.NumField(); i++ {
		f := s.Field(i)
		fmt.Printf(" %s %v \n", f.Type(), f.Interface())
	}
	s.Field(0).SetInt(100)
	s.Field(1).SetString("888888888888888888")

	fmt.Println(s, po)

}
