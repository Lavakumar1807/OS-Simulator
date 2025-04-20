#include <stdio.h>
#include <windows.h>

#define MEMORY_SIZE 1024
#define SHARED_MEMORY_NAME "Local\\shmmap"
int main()
{

    HANDLE map = OpenFileMapping(FILE_MAP_ALL_ACCESS, FALSE , SHARED_MEMORY_NAME);

    if(map ==NULL)
    {
        printf("Could not open file mapping object .\n Error %d\n",GetLastError());
        return 1;
    }

    LPVOID buffer = MapViewOfFile(map , FILE_MAP_ALL_ACCESS, 0, 0, MEMORY_SIZE );
    if(buffer==NULL)
    {

        printf("Could notmap view of file .\n Error %d",GetLastError());
        CloseHandle(map);
    }
    printf("Shared memory read is %s\n",(char *) buffer);
    UnmapViewOfFile(buffer);
    CloseHandle(map);

    return 0;
}