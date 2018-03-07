package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"encoding/json"
)

func main() {

	gin.SetMode(gin.DebugMode) //全局设置环境，此为开发环境，线上环境为gin.ReleaseMode
	router := gin.Default()    //获得路由实例

	//添加中间件
	router.Use(Middleware)
	//注册接口
	router.GET("/simple/server/get", GetHandler)
	router.POST("/simple/server/post", PostHandler)
	router.PUT("/simple/server/put", PutHandler)
	router.DELETE("/simple/server/delete", DeleteHandler)
	//requestBody
	router.POST("/test/body", PostBodyHandler)
	//监听端口
	//http.ListenAndServe(":8005", router)
	router.Run(":8080")
}

func Middleware(c *gin.Context) {
	fmt.Println("this is a middleware!")
}
/**
 * return the json from requestBody
 */
func PostBodyHandler(c *gin.Context) {
	buf := make([]byte, 1024)
	n, _ := c.Request.Body.Read(buf)
	var mapResult map[string]interface{}
	err := json.Unmarshal(buf[:n], &mapResult)
	fmt.Println(err, mapResult)
	var back = make(map[string]interface{})
	if err == nil {
		back = mapResult
	} else {
		back["error"] = err
	}
	c.JSON(http.StatusOK, back)
	return
}
func GetHandler(c *gin.Context) {
	value, exist := c.GetQuery("key")
	if !exist {
		value = "the key is not exist!"
	}
	c.Data(http.StatusOK, "text/plain", []byte(fmt.Sprintf("get success! %s\n", value)))
	return
}
func PostHandler(c *gin.Context) {
	type JsonHolder struct {
		Id   int    `json:"id"`
		Name string `json:"name"`
	}

	holder := JsonHolder{Id: 1, Name: "my name"}
	c.JSON(http.StatusOK, holder)
	return
}
func PutHandler(c *gin.Context) {
	c.Data(http.StatusOK, "text/plain", []byte("put success!\n"))
	return
}
func DeleteHandler(c *gin.Context) {
	c.Data(http.StatusOK, "text/plain", []byte("delete success!\n"))
	return
}
