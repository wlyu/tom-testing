package main

import "fmt"

func main() {

	fmt.Println("Hello, 世界")
	x := 123456
	fmt.Println(x)

	data, i := [3]int{1, 2, 3}, 1
	i, data[i] = 2, 101
	fmt.Println(i, data)

	a, s := test()
	fmt.Println(a, s)

	p := &s
	fmt.Println(p)

	pv := *p
	fmt.Println(pv)

	const xs, ys = 111, 222

	fmt.Println(xs, ys)

	fmt.Println(Monday)

	//for
	s = "aaa中华"
	for i := 0; i < len(s); i++ {
		fmt.Printf("%c", s[i])
	}

	fmt.Println()

	for _, r := range s {
		fmt.Printf("%c", r)
	}
	fmt.Println()

	//------------------

	var s4, myslice = []int{1, 2, 3}, 1 // 未命名类型，隐式转换。
	var s2 []int = s4
	fmt.Println(s2, myslice)

	//==================

	var n = 1001
	if n < 100 {
		fmt.Println(" n<100")
	} else if n == 100 {
		fmt.Println(" n==100")
	} else {
		fmt.Println(" n>100")
	}
	//=============map========
	m := map[string]int{"a": 100, "b": 99}
	for k, v := range m {
		v = v + 1
		m[k] = v
		fmt.Println(k, v)
	}

	fmt.Println(m)

	//==============
	fmt.Println(test2("sum:%d", 1, 2, 3))
	s22 := []int{2, 5, 7}
	fmt.Println(test2("sum:%d", s22...))
	//============function as field
	d := struct {
		fn func() string
	}{
		fn: func() string { return "H______" },
	}
	fmt.Println(d.fn())
	//slice
	data2 := []int{0, 1, 2, 3, 4, 5, 6}
	fmt.Println(&data2)
	slice := data2[1:4:7]
	fmt.Println(slice)
	ssss := make([]int, 0, 5)
	fmt.Println(&ssss)

	//=========copy=======
	data_ := [...]int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
	sq1 := data_[8:]
	sq2 := data_[:5]
	fmt.Println(sq1)
	fmt.Println(sq2)
	copy(sq2, sq1) // dst:sq2, src:sq1
	fmt.Println(sq2)
	fmt.Println(data_)
	//=======迭代式安全删除值===========
	for i := 0; i < 5; i++ {
		m := map[int]string{
			0: "a", 1: "a", 2: "a", 3: "a", 4: "a",
			5: "a", 6: "a", 7: "a", 8: "a", 9: "a",
		}
		fmt.Println(m)
		for k := range m {
			m[k+k] = "x"
			delete(m, k)
		}
		fmt.Println(m)
	}
	//================struct==================

	type Node struct {
		data int
		next *Node
	}
	n4 := Node{4, nil}
	n3 := Node{3, &n4}
	n2 := Node{2, &n3}
	n1 := Node{1, &n2}
	nall := n1
	//===========打印单向链表==========
	for {
		fmt.Print(nall.data, "\t")
		if nall.next == nil {
			break
		}
		nall = *nall.next
	}
	//===========倒序单向链表=========
	nall = n1

	var nNew *Node = nil
	//1============
	for {

		if &nall != nil {
			tmp := nall.data

			nNew = &Node{tmp, nNew}

			if nall.next == nil {
				break
			}
			nall = *nall.next
		}

	}

	var nall2 *Node = &n1
	var nNew2 *Node = nil
	//2============
	for {

		if nall2 != nil {
			tmp := *nall2
			nall2 = tmp.next
			tmp.next = nNew2
			nNew2 = &tmp
		} else {
			break
		}

	}
	//===========打印反向链表==========
	fmt.Println("\n", "===打印反向链表1==")
	nall = *nNew
	for {
		fmt.Print(nall.data, "\t")
		if nall.next == nil {
			break
		}
		nall = *nall.next
	}
	//2===========打印反向链表==========
	fmt.Println("\n", "===打印反向链表2==")
	nall = *nNew2
	for {
		fmt.Print(nall.data, "\t")
		if nall.next == nil {
			break
		}
		nall = *nall.next
	}
}

func test2(s string, n ...int) string {
	var x int
	for _, i := range n {
		x += i
	}
	return fmt.Sprintf(s, x)

}

const (
	Sunday    = iota // 0
	Monday           // 1，通常省略后续⾏表达式。
	Tuesday          // 2
	Wednesday        // 3
	Thursday         // 4
	Friday           // 5
	Saturday         // 6
)

func test() (int, string) {
	return 11, "abc"
}
