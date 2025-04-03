#include <stdio.h>
#include <windows.h>

int main()
{
    HANDLE pipe;
    DWORD dwRead;
    char * PIPE_NAME= "\\\\.\\pipe\\pipet";
    char buffer[128];
    pipe = CreateFile(PIPE_NAME ,GENERIC_READ , 0 ,NULL ,OPEN_EXISTING ,0 , NULL);
    if(pipe==INVALID_HANDLE_VALUE)
    {
        printf("Error opening named pipe \n");
        return 1;
    }
    if(ReadFile(pipe , buffer , sizeof(buffer),&dwRead ,NULL))
    {
        printf("Client received : %s\n",buffer);
    }
    else
    printf("Cannot read from file\n");
    CloseHandle(pipe);
    return 0;
}