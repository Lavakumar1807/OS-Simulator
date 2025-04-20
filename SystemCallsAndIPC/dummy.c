#include <windows.h>
#include <stdio.h>
#include <string.h>
int main()
{
    char * SHARED_MEMORY_NAME= "Local\\shmmap";
    HANDLE map;
    LPCSTR buffer;
    map= CreateFileMapping(INVALID_HANDLE_VALUE,NULL,PAGE_READWRITE,0,1024 ,SHARED_MEMORY_NAME);

    if(map==NULL)
    {
        printf("Could not create mapping object , Error :%d\n",GetLastError());
        return 1;
    }
    buffer = (LPCSTR) MapViewOfFile(map ,FILE_MAP_ALL_ACCESS,0,0,0);

    if(buffer ==NULL)
    {
        printf("Could not Map view of file.\n Error : %d\n",GetLastError());
        return 1;
    }
    char * str ="Transferred shared memory ";
    CopyMemory((PVOID)buffer , str ,strlen(str)+1);

    printf("Message shared : %s\n ", buffer);
    UnmapViewOfFile(buffer);
    CloseHandle(map);
    return 0;

}